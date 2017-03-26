module.exports = function() {
	'use strict';

	angular.module('app').controller('CategoriesController', CategoriesController)
		.service('categoriesService', ['$http', '$q', 'CacheFactory', require('./categoriesService')]);
	
	CategoriesController.$inject = ['categoriesService', '$stateParams', '$scope'];
	require('./categoriesDirective');

	function CategoriesController(categoriesService, $stateParams, $scope) {
		var self = this;
		self.catService = categoriesService;
		self.itemClicked = itemClicked;
		self.showSubs = showSubs;

		self.selected = $stateParams.category;
		self.subActive = false;
		self.isCollapsed = true;

		/**
		 * Get categories from server or cache.
		 */
		self.catService.getCategories($stateParams.expID).then(function(categories) {
			self.subcategories = categories.subcategories;
			self.categories = categories.categories;
		}).catch(function(response) {
			self.errorMessage = 'Unable to retrieve categories :(';
		});

		/**
		 * Set index for css :active
		 */
		function itemClicked(index, isSub) {
			self.selected = index + 1;
			if (isSub) self.subActive = false;
		}

		/**
		 * Show subcategories element.
		 * @event parent mouseenter
		 */
		function showSubs(url, index) {
			self.subActive = true;
			self.currSub = url; // subcategories[currSub]
			self.currSubIndex = index;

			/*var ele = document.getElementById('category-card');
			var childs = ele.querySelectorAll('.list-group-item');
			
			var rect = childs[index].getBoundingClientRect();
			console.log(rect.top, rect.right, rect.bottom, rect.left);
			// - 26.00625 left
			// - 12 top

			var test = document.getElementById('subcategory-card');
			test.style.top = rect.top - 74 + 'px';
			test.style.left = rect.left - 37 + 'px';*/
		}

		return self;
	}
};
