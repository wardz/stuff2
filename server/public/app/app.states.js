module.exports = function($stateProvider, $urlRouterProvider, Config) {
	$urlRouterProvider.otherwise(function($injector) {
		var $state = $injector.get('$state');
		$state.go('404');
	});

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'app/components/home/homeView.html'
		})

		.state('expansion', {
			url: '/e/:expID?category&page',
			templateUrl: 'app/components/addons/addonsView.html',
			controller: 'AddonsController',
			controllerAs: 'ctrl',
			onEnter: ['$state', '$stateParams', 'Config', require('./components/addons/addonsOnEnter')]
		})

		.state('addon', {
			url: '/i/:expID/:addonName',
			templateUrl: 'app/components/addon/addonView.html',
			controller: 'AddonController',
			controllerAs: 'ctrl'
		})

		.state('login', {
			url: '/login',
			templateUrl: 'app/components/login/loginView.html',
			controller: 'LoginController',
			controllerAs: 'ctrl',
			pageTitle: 'Authenticate user',
			data: { roles: { 'umod': 2, 'user': 2, 'guest': 1 } },
		})

		.state('upload', {
			url: '/upload',
			templateUrl: 'app/components/upload/uploadView.html',
			data: { roles: { 'umod': 1, 'user': 1 } },
			controller: 'UploadController',
			controllerAs: 'ctrl'
		})

		.state('register', {
			url: '/register',
			templateUrl: 'app/components/register/registerView.html',
			controller: 'RegisterController',
			controllerAs: 'ctrl',
			pageTitle: 'Register account',
			data: { roles: { 'umod': 2, 'user': 2, 'guest': 1 } },
		})

		.state('account', {
			url: '/account',
			templateUrl: 'app/components/account/accountView.html',
			controller: 'AccountController',
			controllerAs: 'ctrl',
			data: { roles: { 'umod': 1, 'user': 1 } }
		})

		.state('tutorial', {
			url: '/tutorial',
			pageTitle: 'How to install addons',
			templateUrl: 'app/components/tutorial/tutorialView.html'
		})

		.state('404', {
			url: '/404',
			pageTitle: 'Page not found',
			templateUrl: 'app/shared/404.html'
		})

		.state('privacy', {
			pageTitle: 'Privacy',
			url: '/privacy',
			templateUrl: 'app/shared/privacy.html'
		});
};
