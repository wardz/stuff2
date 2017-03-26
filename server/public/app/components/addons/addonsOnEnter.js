// Redirect to correct URL if no state parameters are given
module.exports = function($state, $stateParams, Config) {
	'use strict';

	var expID = $stateParams.expID;
	if (!expID || !Config.expansions[expID]) {
		$state.go('404');
	} else if (!$stateParams.category || !$stateParams.page) {
		$state.go('expansion', {
			expID: expID,
			category: 0,
			page: 1
		});
	}
};
