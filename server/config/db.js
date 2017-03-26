var mysql = require('mysql');

/**
 * MySQL database connections for user & addon DB.
 * @param {Object} wagner - Reference to wagner core instance.
 */
module.exports = function(wagner) {
	var ENV_IS_DEV = process.env.NODE_ENV === 'DEVELOPMENT';
	var poolCluster = mysql.createPoolCluster();

	var addonsConfig = {
		host: 		process.env.DB_HOST_ADDONS,
		user: 		process.env.DB_USER,
		password: 	process.env.DB_PASS_ADDONS,
		port: 		process.env.DB_PORT,
		ssl: 		process.env.DB_SSL,
		database: 	'addons',
		trace: 		ENV_IS_DEV,

		connectionLimit: 40,
		restoreNodeTimeout: 10000,
		removeNodeErrorCount: Infinity
	};

	var usersConfig = {
		host: 		process.env.DB_HOST,
		user: 		process.env.DB_USER,
		password: 	process.env.DB_PASS,
		port: 		process.env.DB_PORT,
		ssl: 		process.env.DB_SSL,
		database: 	'sessions',
		trace: 		ENV_IS_DEV,

		connectionLimit: 20,
		restoreNodeTimeout: 10000,
		removeNodeErrorCount: Infinity
	};

	poolCluster.add('ADDONS', addonsConfig);
	poolCluster.add('USERS', usersConfig);
	wagner.constant('poolCluster', poolCluster);
};
