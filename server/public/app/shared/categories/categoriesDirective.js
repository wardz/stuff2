module.exports = angular.module('app').directive('categories', function() {
	return {
		templateUrl: '/app/shared/categories/categoriesView.html',
		controller: 'CategoriesController',
		controllerAs: 'catCtrl',
		bindToController: true
	};
});
