require('./vendor/loadScript');

angular.module('app', [
	'ng',
	'ui.router',
	'ui.bootstrap',
	'ngLoadScript',
	'angular-cache'
])

.constant('Config', {
	captchaPublicKey: '',
	expansions: {
		'vanilla': 1,
		'tbc': 1,
		'wotlk': 1
	}
})

.factory('userService', ['$http', '$q', '$timeout', require('./shared/userService')])

.config(['$stateProvider', '$urlRouterProvider', 'Config', require('./app.states')])

.config(['$compileProvider', '$locationProvider', '$httpProvider', function($compileProvider, $locationProvider, $httpProvider) {
	$compileProvider.debugInfoEnabled(false);
	$locationProvider.html5Mode(true);
	$httpProvider.useApplyAsync(true);
}])

.run(['$rootScope', 'userService', '$state', require('./app.statehandler')]);

require('./shared/nav/navController')();
require('./components/addons/addonsController')();
require('./shared/categories/categoriesController')();
require('./components/login/loginController')();
require('./components/register/registerController')();
require('./components/upload/uploadController')();
require('./components/addon/addonController')();
require('./components/account/accountController')();
