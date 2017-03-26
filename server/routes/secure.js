var express = require('express');
var bodyparser = require('body-parser');
var csrf = require('csurf')();
var uuid = require('node-uuid');
var AwsS3Form = require('aws-s3-form');
var winston = require('winston');
var vld = require('../libs/validation');

// TODO move to config file
var USER_REGEX = new RegExp(/^[a-zA-Z]{2,15}$/);
var ADDON_REGEX = new RegExp(/^[a-zA-Z]{2,17}$/); // 2,18 ?
var MAX_PASSWORD_LENGTH = 32;
var MIN_PASSWORD_LENGTH = 6;
var MIN_ADDON_NAME_LENGTH = 3;
var MAX_ADDON_NAME_LENGTH = 18
var PASSPORT_ERROR_MSG = 'Unknown server error. Please try again shortly.';

/**
 * @param {Object} passport - Reference to passport instance.
 * @param {Object} wagner - Reference to wagner-core instance.
 */
module.exports = function(passport, wagner) {
	var api = express.Router();
	api.use(bodyparser.urlencoded({ extended: false, parameterLimit: 20 }));
	api.use(bodyparser.json());

	/**
	 * Custom CSURF error message on invalid POST requests.
	 * Always use this to prevent detailed error logs from being sent.
	 */
	function csrfError(err, req, res, next) {
		if (err.code !== 'EBADCSRFTOKEN') return next(err);

		return res.status(403).json({ msg: 'invalid csrf token' }); // TODO config file for msgs
	};

	/**
	 * Return CSRF token to client.
	 */
	api.get('/csrf', csrf, function(req, res) {
		return res.status(200).json({ token: req.csrfToken() });
	});

	/**
	 * Return user's DB columns.
	 */
	api.get('/me', isAuth, function(req, res) {
		return res.status(200).json({ msg: { 
				user: req.user.username,
				role: req.user.permissions
			}
		});
	});

	/**
	 * Destroy user session.
	 */
	api.get('/logout', isAuth, function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/**
	 * Authenticate user.
	 */
	api.post('/login', isNotAuth, csrf, csrfError, function(req, res) {
		var user = req.body.username;
		var pass = req.body.password;

		// Validate parameters
		if (!pass || pass.length > MAX_PASSWORD_LENGTH || pass.length < MIN_PASSWORD_LENGTH) {
			return res.status(422).json({ msg: 'Invalid password' });
		} else if (!user || !user.match(USER_REGEX)) {
			return res.status(422).json({ msg: 'Invalid username' });
		}

		// Authenticate
		passport.authenticate('local-login', function(err, user, msg) {
			if (err) {
				winston.log('error', err);
				return res.status(400).json({ msg: PASSPORT_ERROR_MSG });
			} else if (!user) {
				return res.status(401).json({ msg: msg.error });
			}

			// Setup session
			req.login(user, function(err) {
				if (err) {
					winston.log('error', err);
					return res.status(500).json({ msg: PASSPORT_ERROR_MSG });
				}

				return res.status(200).json({ msg: {
						user: req.user.username,
						role: req.user.permissions
					}
				});
			});
		})(req, res);
	});

	/**
	 * Register user.
	 */
	api.post('/register', isNotAuth, csrf, csrfError, function(req, res) {
		var user = req.body.username;
		var pass = req.body.password
		var captcha = req.body.captchaResponse;

		if (!captcha) {
			return res.status(422).json({ msg: 'empty captcha' });
		} else if (!pass || pass.length > MAX_PASSWORD_LENGTH || pass.length < MIN_PASSWORD_LENGTH) {
			return res.status(422).json({ msg: 'invalid password length' });
		} else if (pass !== req.body.repassword) {
			return res.status(422).json({ msg: 'invalid password match' });
		} else if (!user.match(USER_REGEX)) {
			return res.status(422).json({ msg: 'invalid username' });
		}

		// Create user
		passport.authenticate('local-signup', function(err, user, msg) {
			if (err) {
				winston.log('error', err);
				return res.status(400).json({ msg: PASSPORT_ERROR_MSG });
			} else if (!user) {
				return res.status(401).json({ msg: msg.error });
			}

			return res.status(200).json({ msg: 'success' });
		})(req, res);
	});

	/**
	 * Upload new addon to DB and AWS S3.
	 * (Prototype so a lot is hardcoded)
	 * @params {Object} formGen - Reference to instance of aws-s3-form.
	 */
	api.post('/insertaddon', isAuth, csrf, csrfError, wagner.invoke(function(formGen, poolCluster, winston) {
		return function(request, response) {
			var body = request.body;
			var expansion = body.expansion;
			var addon = body.name;
			var author = body.author;
			var description = body.description;
			var category_id = body.category_id;

			// Validate parameters
			if (!vld.isExpansion(expansion)) {
				return response.status(400).json({ msg: 'incorrect expansion' });
			 } else if (!vld.isLen(description, 10, 254)) {
				return response.status(400).json({ msg: 'incorrect description' });
			} else if (!vld.isLen(addon, 3, 18) || !vld.isAZ(addon) || !vld.isLen(author, 3, 18) || !vld.isAZ(author)) {
				return response.status(400).json({ msg: 'incorrect name or author' });
			} else if (!vld.isInt(category_id) || !vld.isRange(category_id, 1, 48)) {
				return response.status(400).json({ msg: 'incorrect category id' });
			}

			expansion += '_addon';

			// Get addon DB
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(400).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				conn.query('SELECT * FROM ?? WHERE name = ? AND user_id = ?', [expansion, addon, request.user.id], function(err, rows) {
					if (err) {
						conn.release();
						winston.log('error', err);
						return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}

					var sql, inserts;
					if (rows.length) {
						// If addon already exists, just update it, but only if it belongs to user id.
						sql = 'UPDATE ?? SET name = ?, author = ?, description = ?, category_id = ? WHERE name = ? AND user_id = ?';
						inserts = [expansion, addon, author, description, category_id, addon, request.user.id];
					} else {
						sql = 'INSERT INTO ?? (name, author, description, category_id, user_id) VALUES (?, ?, ?, ?, ?)';
						inserts = [expansion, addon, author, description, category_id, request.user.id];
					}

					// Query expansion_addon
					conn.query(sql, inserts, function(err, rows) {
						conn.release();
						if (err) {
							winston.log('error', err);
							return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
						}

						return response.status(200).json({ msg: 'success' });
					});
				});
			});
		};
	}));

	// prototype
	api.post('/uploadfile', isAuth, csrf, csrfError, wagner.invoke(function(formGen, poolCluster, winston) {
		return function(request, response) {
			// upvalues
			var rb = request.body;
			var expansion = rb.expansion;
			var fname = rb.file_name;
			var size = rb.size;
			var version = rb.version;
			var addon = rb.addon;

			if (!vld.isExpansion(expansion)) {
				return response.status(400).json({ msg: 'invalid expansion' });
			} else if (!vld.isLen(fname, 1, 30)) {
				return response.status(400).json({ msg: 'invalid filename' });
			} else if (!vld.isLen(version, 1, 20)) {
				return response.status(400).json({ msg: 'invalid version' });
			} else if (!vld.isLen(size, 1, 20)) {
				return response.status(400).json({ msg: 'invalid size' });
			} else if (!vld.isLen(addon, 3, 18) || !vld.isAZ(addon)) {
				return response.status(400).json({ msg: 'invalid addon' });
			}

			var key = fname + '-' + (uuid.v4().slice(0, 7));

			var root = '/' + expansion + '/';
			var filePath = expansion + '_file';
			expansion = expansion + 'addon';

			var data = formGen.create(root + key, {
				contentType: 'application/zip',
				customConditions: [
					['content-length-range', 1024, 104857600], // TODO which one is right?
					{'content-length-range': [1024, 104857600]}
				]
			});

			if (!data.fields || data.fields.length === 0) {
				winston.log('error', 'Error creating s3 policy.');
				return response.status(400).json({ msg: 'error creating token' });
			}

			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(400).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				conn.query('SELECT * FROM ?? WHERE name = ? AND user_id = ?', [expansion, addon, request.user.id], function(err, rows) {
					if (err || !rows.length) {
						conn.release();
						winston.log('error', err);
						return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}
					
					var link = process.env.SERVER_URL + root + key;

					conn.query('INSERT INTO ?? (file_name, link, size, version) VALUES (?, ?, ?, ?) WHERE addon_id = ?',
					[filePath, fname, link, size, version, rows.addon_id],
					function(err, irows) {
						conn.release();
						if (err) {
							winston.log('error', err);
							return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
						}

						return response.status(200).json({ data });
					});
				});
			});
		};
	}));

	api.get('/account', isAuth, wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(400).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				var id = request.user.id;

				conn.query('SELECT a.*, b.*, c.* FROM vanilla_addon a, tbc_addon b, wotlk_addon c WHERE a.user_id = ? AND b.user_id = a.user_id AND c.user_id = b.user_id',
				[id, id, id], function(err, rows) {
					conn.release();
					if (err) {
						winston.log('error', err);
						return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}

					return response.status(200).json({ msg: rows });
				});
			});
		}
	}));

	return api;
};

// Helper functions

// Check if user is logged in
function isAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	return res.status(200).json({ msg: 'unauthorized' }); // use 200 to prevent error msg in browser console
}

// Check if user is not logged in
function isNotAuth(req, res, next) {
	if (!req.isAuthenticated()) return next();
	return res.status(400).json({ msg: 'already logged in' });
}
