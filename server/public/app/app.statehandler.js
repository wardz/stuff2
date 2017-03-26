module.exports = function($rootScope, userService, $state) {
	var isFirstTime = true;
	var NO_ACCESS = 2;
	$rootScope.isPageLoaded = true;

	/**
	 * Validate if user has the correct permissions to view route.
	 */
	$rootScope.$on('$stateChangeStart', function(event, next, toParams) {
		if (next.data) {
			if (!userService.loggedIn && isFirstTime) {
				// Delay check on first page load to avoid race condition
				return userService.fetchInfo().then(checkPermissions).catch(checkPermissions);
			} else {
				checkPermissions();
			}

			function checkPermissions() {
				var userRole = userService.role || 'guest';
				var roles = next.data.roles;
				isFirstTime = false;

				if (!roles[userRole]) {
					// User is not logged in
					event.preventDefault();
					return $state.go('login');
				} else {
					if (roles[userRole] === NO_ACCESS) {
						// User does not have correct permissions
						event.preventDefault();
						return $state.go('home');
					}
				}
			}
		}

		if (toParams.expID === 'tbc' || toParams.expID === 'wotlk') {
			event.preventDefault();
			alert('Sorry! This expansion is not yet supported. Come back later.');
			return;
		}
	});

	/**
	 * Set document title based on current route.
	 */
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
		if (toState.pageTitle) {
			$rootScope.pageTitle = toState.pageTitle;
		} else if (toParams.expID) {
			$rootScope.pageTitle = 'Browse ' + toParams.expID + ' addons'; // xss!
		} else {
			$rootScope.pageTitle = 'Browse classic addons';
		}
	});
};
