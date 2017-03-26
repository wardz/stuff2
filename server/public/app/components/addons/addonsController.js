module.exports = function() {
	'use strict';

	angular.module('app')
		.controller('AddonsController', AddonsController)
		.service('addonService', ['$http', '$q', require('./addonsService')])
		.filter('encodeURI', ['$window', function($window) {
			return $window.encodeURIComponent;
		}]);
	AddonsController.$inject = ['$stateParams', '$rootScope', '$state', 'addonService', 'userService', 'categoriesService', '$location', '$scope'];

	var patches = {
		vanilla: '1.12.1',
		tbc: '2.4.3',
		wotlk: '3.3.5'
	}

	function AddonsController($stateParams, $rootScope, $state, addonService, userService, categoriesService, $location, $scope) {
		var self = this;
		var addonsLoaded = false;
		self.user = userService;
		self.addonService = addonService;
		self.catService = categoriesService;
		self.currentExpansion = $stateParams.expID;
		self.patch = patches[$stateParams.expID];
		self.orderList = orderList;
		self.pageClick = pageClick;
		self.search = search;
		self.addonData = [];
		self.amount = 0;
		self.total = 0;
		self.pages = [];
		$scope.formData = {};

		self.catService.getCategoryIds($stateParams.expID).then(function(categories) {
			self.subcategories = categories.subcategories;
			self.categories = categories.categories;
		}).catch(function(res) {
			console.log(res);
		});

		getAllAddons();

		function getAllAddons() {
			if (addonsLoaded) return;
			console.log('ran');
			addonsLoaded = true;
			self.addonService.browse($stateParams.expID, $stateParams.category, $stateParams.page || 0).then(function(data) {
				self.addonData = data.msg;
				self.amount = self.addonData.length;
				self.empty = self.amount === 0;
				self.total = data.total[0]['FOUND_ROWS()'];
				genPages();
			}).catch(function(err) {
				self.errorMessage = 'Unable to retrieve addons :( Please refresh and try again.';
			});
		}

		//$rootScope.$on('$stateChangeSuccess', function(event, toState, fromState) {
			if ($location.hash()) orderList($location.hash());
		//});

		function orderList(type) {
			self.orderType = type;
		}

		function pageClick(val) {
			if (!val || val < 1) return;
			$state.transitionTo('expansion', { expID: $stateParams.expID, category: $stateParams.category, page: Math.floor(val) });
		}

		function genPages() {
			self.pages = [];
			for (var i = $stateParams.page, n = Math.floor(self.total / 15); i < n; i++) {
				self.pages.push(i);
			}
			if (self.pages.length === 0) self.pages.push('1');
		}

		function search() {
			var keywords = $scope.formData.searchInput;
			if (!keywords) {
				return;
			} else if (keywords.length <= 1) {
				getAllAddons();
				return;
			} else if (keywords.length <= 2) {
				return;
			}

			addonsLoaded = false;
			self.addonService.search($stateParams.expID, keywords).then(function(data) {
				self.addonData = data.msg;
				self.amount = self.addonData.length;
				self.empty = self.amount === 0;
				self.total = self.amount;
				genPages();
			}).catch(function(response) {
				console.log(response);
			});
		}

		return self;
	}
};
