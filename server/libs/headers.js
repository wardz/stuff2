/**
 * Set default headers used top-level.
 */
module.exports.default = function() {
	var IS_PROD = process.env.NODE_ENV === 'PRODUCTION';
	var csp = "";
	
	return function(req, res, next) {
		// Misc
		res.setHeader('X-Robots-Tag', 'index, follow');
		res.setHeader('Cache-Control', 'private, max-age=0');

		// Security
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Download-Options', 'noopen');
		res.setHeader('X-Frame-Options', 'DENY');
		res.setHeader('Access-Control-Allow-Origin', 'false');
		res.setHeader('X-XSS-Protection', '1; mode=block'); // Security risk on IE8, but angular doesn't support IE8 anyways
		//res.setHeader('Content-Security-Policy', csp);

		if (IS_PROD) {
			//res.setHeader('Strict-Transport-Security', 'max-age=31536000; preload');
			//res.setHeader('Public-Key-Pins', 'pin-sha256=""; pin-sha256=""; max-age="5184000"; includeSubDomains');
		}

		return next();
	};
};

/**
 * Disable cache & indexing.
 */
module.exports.noCache = function() {
	return function(req, res, next) {
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		res.setHeader('X-Robots-Tag', 'none');
		res.setHeader('X-DNS-Prefetch-Control', 'off');
		res.removeHeader('ETag');
		
		return next();
	};
};
