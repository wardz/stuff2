var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

/**
 * MySQL session storage connection setup.
 * @param {Object} app - Reference to express app instance.
 */
module.exports = function(app) {
	var ENV_IS_DEV = process.env.NODE_ENV === 'DEVELOPMENT';
	var SESSION_MAXAGE = 3600000;

	var sessionStore = new MySQLStore({
		database: 	'sessions',
		host: 		process.env.DB_HOST,
		port: 		process.env.DB_PORT,
		user: 		process.env.DB_USER,
		password: 	process.env.DB_PASS,
		ssl: 		process.env.DB_SSL,
		trace: 		ENV_IS_DEV,

		expiration: SESSION_MAXAGE,
		autoReconnect: true,
		useConnectionPooling: true
	});

	app.use(session({
		store: sessionStore,
		resave: true,
		saveUninitialized: false,
		name: 'sid',

		secret: [
			process.env.COOKIE_SECRET1,
			process.env.COOKIE_SECRET2,
			process.env.COOKIE_SECRET3,
			process.env.COOKIE_SECRET4
		],

		cookie: {
			//domain: '',
			maxAge: SESSION_MAXAGE,
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: ENV_IS_DEV ? 'auto' : true
		}
	}));
};
