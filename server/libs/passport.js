var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
var grecaptcha = require('./grecaptcha');
var bcrypt;

if (process.env.NODE_ENV === 'DEVELOPMENT') {
	bcrypt = require('bcrypt-nodejs'); // requires no dependencies on windows
} else {
	bcrypt = require('bcrypt');
}

// TODO add to config file
var INCORRECT_DETAILS = { error: 'Incorrect username and/or password.' };
var INCORRECT_CAPTCHA = { error: 'Incorrect or empty captcha.' };
var USER_TAKEN = { error: 'Username is already in use.' };

module.exports = function(passport, wagner) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(wagner.invoke(function(poolCluster, winston) {
		return function(id, done) {
			poolCluster.getConnection('USERS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return done(err);
				}

				conn.query('SELECT * FROM users WHERE id = ?', [id], function(err, rows) {
					conn.release();
					done(err, rows[0]);
				});
			});
		};
	}));

	// TODO switch to using named functions

	/**
	 * Register strategy
	 */
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	wagner.invoke(function(poolCluster, winston) {
		return function(req, user, password, done) {
			async.parallel([
				// Validate captcha
				function(callback) {
					grecaptcha.validate(req.body.captchaResponse, null, function(err, success) {
						return callback(err, success);
					});
				},

				// Get DB connection
				function (callback) {
					poolCluster.getConnection('USERS', function(err, conn) {
						return callback(err, conn);
					});
				}

			], function(err, results) {
				var conn = results[1];
				if (err) {
					if (conn) conn.release(); // release if captcha error, not sql
					winston.log('error', err);
					return done(err);
				}

				if (!results[0])
					return done(null, false, INCORRECT_CAPTCHA);

				// Check if user is taken
				conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, rows) {
					if (err || rows.length) {
						conn.release();
						return done(err, false, USER_TAKEN);
					}

					// Hash password
					bcrypt.hash(password, null, null, function(err, hash) {
						if (err) {
							conn.release();
							return done(err);
						}

						var newUser = {
							username: user,
							password: hash
						};

						// Save user
						conn.query('INSERT INTO users (username, password, email, ip_address) VALUES(?, ?, ?, ?)',
							[newUser.username, newUser.password, newUser.username, req.ip],
							function(err, rows) {
								conn.release();
								if (err) return done(err);

								newUser.id = rows.insertId;
								return done(null, newUser);
							});
					});
				});
			});
		 };
	})));

	/**
	 * Login strategy
	 */
	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	wagner.invoke(function(poolCluster, winston) {
		return function(req, user, password, done) {
			poolCluster.getConnection('USERS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return done(err);
				}

				// Get existing user
				conn.query('SELECT * FROM users WHERE username = ?', [user], function(err, rows) {				
					if (err || !rows.length) {
						conn.release();
						return done(err, false, INCORRECT_DETAILS);
					}

					// Validate captcha if required
					var attempts = rows[0].failed_attempts;
					grecaptcha.validate(req.body.captchaResponse, attempts, function(err, success) {
						if (err || !success) {
							return done(err, false, INCORRECT_CAPTCHA);
						}

						// Compare passwords
						bcrypt.compare(password, rows[0].password, function(err, res) {
							if (err || !res) {
								conn.release();
								return done(err, false, INCORRECT_DETAILS);
							}

							if (attempts > 0) {
								// Reset captcha on succesfull login
								conn.query('UPDATE users SET failed_attempts = 0 WHERE id = ?', [rows[0].id], function(err, rows) {
									conn.release();
									if (err) winston.log('error', err);
								});
							} else {
								conn.release();
							}

							return done(null, rows[0]);
						});
					});
				});
			});
		};
	})));
};
