var mexport = module.exports;

// TODO move these to config file

// Needs to match db tables prefix (vanilla_file -> vanilla)
var expansions = {
	'vanilla': 1,
	'tbc': 1,
	'wotlk': 1
};

var AZ_REGEX = new RegExp(/^[a-zA-Z]+$/);

var DEFAULT_LEN = {
	addon: {
		max: 18,
		min: 3
	}
}

mexport.DB_CONN_ERROR_MSG = 'Unable to connect to server. Please wait 10 seconds and then refresh the page.';
mexport.DB_QUERY_ERROR_MSG = 'Unable to query server. Please wait 10 seconds and then refresh the page.';
mexport.INVALID_EXPANSION = 'Invalid expansion.';
mexport.INVALID_PARAMS = 'Invalid parameters given for query.';

/**
 * Check if string given exists as an expansion in DB.
 * @param {String} val - The string to check.
 * @returns {Boolean} True if exists.
 */
mexport.isExpansion = function(val) {
	if (!val) return false;
	return expansions[val] ? true : false;
};

/**
 * Check if string given can be converted to uint.
 * @param {String} val - The string to check.
 * @returns {Boolean} True if possible.
 */
mexport.isInt = function(val) {
	if (!val) return false;
    var isInt = (Number(parseInt(val)) == val);
    if (isInt && val >= 0) return true;
    return false;
};

/**
 * Check if string contains only characters a to z or A-Z.
 * @param {String|undefined} val - The string to check.
 * @returns {Boolean} True if only contains a-z.
 */
mexport.isAZ = function(val) {
	if (!val) return false;
	return val.match(AZ_REGEX) ? true : false;
};

/**
 * Check if string length is within certain range.
 * @param {String|undefined} str - The string to check.
 * @param {Number|String} min - Minimum range.
 * @param {Number|Undefined} max - Maximum range.
 * @returns {Boolean} True if is in range.
 */
mexport.isLen = function(str, min, max) {
	if (!str) return false;
	if (typeof min === 'string') {
		max = DEFAULT_LEN[min].max;
		min = DEFAULT_LEN[min].min;
	}

	if (str.length < min || str.length > max) return false;
	return true;
};

/**
 * Check if number is within certain range.
 * @param {Number|undefined} val - The number to check.
 * @param {Number} min - Minimum range.
 * @param {Number} max - Maximum range.
 * @returns {Boolean} True if is in range.
 */
mexport.isRange = function(val, min, max) {
	if (!val) return false;
	if (val < min || val > max) return false;
	return true;
};
