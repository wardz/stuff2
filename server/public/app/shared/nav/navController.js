module.exports = function() {
	'use strict';

	angular.module('app').controller('NavController', NavController);
	NavController.$inject = ['$scope', 'userService'];
	require('./navDirective');

	function NavController($scope, userService) {
		var self = this;
		$scope.user = userService;
		self.isCollapsed = false;
		self.collapseClass = {
			'nav-pills': false,
			'nav-stacked': false,
			'navbar-nav': true
		};

		/**
		 * Handle hamburger close/open.
		 * Called on click.
		 */
		self.collapse = function() {
			var state = !self.isCollapsed;
			self.isCollapsed = state

			self.collapseClass['nav-pills'] = state;
			self.collapseClass['nav-stacked'] = state
			self.collapseClass['navbar-nav'] = !state;
		}

		return self;
	}
};
