var winston = require('winston');

/**
 * Setup winston logging.
 * @param {Object} wagner - Reference to wagner core instance.
 */
module.exports = function(wagner) {
	var logger = new winston.Logger({
		transports: [
			new (winston.transports.File)({
				name: 'info',
				filename: 'info.log',
				level: 'info'
			}),

			new (winston.transports.File)({
				name: 'error',
				filename: 'error.log',
				level: 'error'
			})
		]
	});

	if (process.env.NODE_ENV === 'DEVELOPMENT') {
		logger.add(winston.transports.Console);
	}

	wagner.constant('winston', logger);
};
