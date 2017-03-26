var needle = require('needle');

var ATTEMPTS_REQUIRED = 5;
var CAPTCHA_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Send POST request to google servers to verify if client's captcha was correct.
 * Callback second parameter will be true on success.
 * @TODO add ratelimiter per user/ip
 * @param {String|Undefined} key - The clients grecaptcha key/token.
 * @param {Number} attempts - The clients failed attempts.
 * @param {Object} callback - Callback function
 */
module.exports.validate = function(key, attempts, callback) {
	// if (process.env.NODE_ENV === 'DEVELOPMENT') attempts = 0;
	if (!attempts) attempts = 5;

	if (attempts >= ATTEMPTS_REQUIRED) {
		if (!key) return callback(null, false);
		var data = {
			secret: process.env.GRECAPTCHA_SECRET,
			response: key
		};

		return needle.post(API_URL, data, function(error, res, body) {
			callback(error, body.success);
		});
	}

	return callback(null, true);
};
