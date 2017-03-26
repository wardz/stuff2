var express = require('express');
var bodyparser = require('body-parser');
var vld = require('../libs/validation');
var async = require('async');

var isExpansion = vld.isExpansion;
var isInt = vld.isInt;
var isLen = vld.isLen;
var isRange = vld.isRange;

/**
 * Handles core API calls that does not require authentication.
 * @param {Object} wagner - Reference to wagner-core instance.
 */
module.exports = function(wagner) {
	var api = express.Router();
	api.use(bodyparser.urlencoded({ extended: false, parameterLimit: 5 }));

	/**
	 * Retrieve list of all addons belonging to expansion, pageid & categoryid given.
	 * @params {Object} poolCluster - Reference to MySQL pool cluster instance.
	 * @params {Object} winston - Reference to Winston instance.
	 */
	api.get('/browse/:expansion', wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			var expansion = request.params.expansion;	// I.e 'vanilla'
			var category = request.query.category;		// '5'
			var page = request.query.page;				// '2'

			// Validate parameters
			if (!isExpansion(expansion)) {
				return response.status(400).json({ msg: vld.INVALID_EXPANSION });
			} else if (!isInt(category) || !isInt(page)) {
				return response.status(400).json({ msg: vld.INVALID_PARAMS });
			}

			// Get addons DB
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(500).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				// Build query
				var pageOffset = (page - 1) * 15;
				var sql, inserts;
				if (category === '0') {
					sql = 'SELECT SQL_CALC_FOUND_ROWS * FROM ?? WHERE is_public = 1 LIMIT ?,15';
					inserts = [expansion + '_addon', pageOffset];
				} else {
					sql = 'SELECT SQL_CALC_FOUND_ROWS * FROM ?? WHERE is_public = 1 AND category_id = ? LIMIT ?,15';
					inserts = [expansion + '_addon', parseInt(category), pageOffset];
				}

				// Fetch info from DB
				conn.query(sql, inserts, function(err, rows) {
					if (err) {
						winston.log('error', err);
						return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}

					conn.query('SELECT FOUND_ROWS()', function(err, count) {
						conn.release();
						if (err) {
							winston.log('error', err);
							return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
						}

						return response.status(200).json({ msg: rows, total: count });
					});
				});
			});
		};
	}));

	/**
	 * Retrieve info about a single specific addon.
	 * @params {Object} poolCluster - Reference to MySQL pool cluster instance.
	 * @params {Object} winston - Reference to Winston instance.
	 */
	api.get('/fetch/:expansion/:addon', wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			var expansion = request.params.expansion;	// I.e 'vanilla'
			var addon = request.params.addon;			// 'Addon%20name%20here'

			// Validate parameters
			if (!isExpansion(expansion)) {
				return response.status(400).json({ msg: vld.INVALID_EXPANSION });
			} else if (!isLen(addon, 'addon')) {
				return response.status(400).json({ msg: 'Invalid addon length.' });
			}

			// Format name
			addon = decodeURI(addon);

			// Get addons DB
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(500).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				// table names
				var joinTable = expansion + '_file'
				expansion += '_addon';

				// Fetch info from DB
				conn.query('SELECT * FROM ?? AS a INNER JOIN ?? AS b ON a.id = b.id WHERE a.name = ?', [expansion, joinTable, addon], function(err, rows) {
					conn.release();
					if (err) {
						winston.log('error', err);
						return response.status(400).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}

					return response.status(200).json({ msg: rows });
				});
			});
		};
	}));

	/**
	 * Retrieve all categories and subcategories belonging to expansion given.
	 * @params {Object} poolCluster - Reference to MySQL pool cluster instance.
	 * @params {Object} winston - Reference to Winston instance.
	 */
	api.get('/categories/:expansion', wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			var expansion = request.params.expansion;
			if (!isExpansion(expansion)) {
				return response.statuts(400).json({ msg: vld.INVALID_EXPANSION });
			}

			// Get addons DB
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(500).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				// Table name
				expansion += '_category';
				
				// Run queries in parallel
				async.parallel([
					// Get child categories
					function(callback) {
						conn.query('SELECT c1.name, c1.Name, c1.Id AS pname, c2.name, c2.id FROM ?? c1 JOIN ?? c2 ON c1.id = c2.parent_id', [expansion, expansion], function(err, rows) {
							return callback(err, rows);
						});
					},

					// Get parent categories
					function(callback) {
						conn.query('SELECT * FROM ?? WHERE parent_id IS NULL', [expansion], function(err, rows) {
							return callback(err, rows)
						});
					}
				], function(err, results) {
					conn.release();
					if (err) {
						winston.log('error', err);
						return response.status(500).json({ msg: vld.DB_QUERY_ERROR_MSG });
					}

					return response.status(200).json({ categories: results[1], subcategories: results[0] });
				});
			});
		};
	}));

	/**
	 * Search for addon in DB.
	 * @params {Object} poolCluster - Reference to MySQL pool cluster instance.
	 * @params {Object} winston - Reference to Winston instance.
	 */
	api.get('/search/:expansion/:name', wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			var expansion = request.params.expansion;
			var name = request.params.name;
			
			if (!isExpansion(expansion)) {
				return response.status(400).json({ msg: vld.INVALID_EXPANSION });
			} else if (!isLen(name, 'addon')) {
				return response.status(400).json({ msg: vld.INVALID_PARAMS });
			}

			// Get addons DB
			poolCluster.getConnection('ADDONS', function(err, conn) {
				if (err) {
					winston.log('error', err);
					return response.status(500).json({ msg: vld.DB_CONN_ERROR_MSG });
				}

				// Table name
				expansion += '_addon';
				
				conn.query('SELECT * FROM ?? WHERE name LIKE ' + conn.escape('%' + name + '%'), [expansion], function(err, rows) {
					conn.release();
					if (err) {
						winston.log('error', err);
						return response.status(500).json({ msg: vld.DB_CONN_ERROR_MSG });
					}

					return response.status(200).json({ msg: rows });
				});
			});
		};
	}));

api.get('/dl/:key', wagner.invoke(function(poolCluster, winston) {
		return function(request, response) {
			// send S3 link to user
			// update DB downloads
		};
	}));

	return api;
};
