module.exports = angular.module('app').directive('navmenu', function() {
	return {
		templateUrl: '/app/shared/nav/navView.html',
		controller: 'NavController',
		controllerAs: 'navCtrl',
		bindToController: true
	};
});
