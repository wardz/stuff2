module.exports = function() {
	'use strict';

	angular.module('app')
		.controller('UploadController', UploadController)
		.service('uploadService', ['$http', '$q', require('./uploadService')]);
	UploadController.$inject = ['$scope', 'uploadService', 'categoriesService', 'userService'];

	function UploadController($scope, uploadService, categoriesService, userService) {
		var self = this;
		self.uploadService = uploadService;
		self.catService = categoriesService;
		self.user = userService;
		self.submit = submit;
		self.isFormErrors = isFormErrors;
		self.resetError = resetError;
		self.isSubmitting = true;
		$scope.formData = {};

		/**
		 * Get client CSRF token from server.
		 */
		self.user.fetchToken().then(function(token) {
			$scope.formData._csrf = token;
			self.isSubmitting = false;
		}).catch(function(errorMsg) {
			self.errorMessage = errorMsg + ' Please wait 5 seconds and refresh the page to try again.';
		});

		/**
		 * Get cached/uncached categories on expansion chosen.
		 */
		$scope.$watchCollection('formData.expansion', function(value) {
			if (!value) return;
			
			self.catService.getCategories(value).then(function(categories) {
				self.subcategories = {};
				var main = categories.categories;
				main.splice(0, 1)
				self.subcategories['Main'] = main;

				for (var item in categories.subcategories) {
					var elem = categories.subcategories[item];
					
					for (var i = 0, n = elem.length; i < n; i++) {
						var parent = elem[i].Name;
						self.subcategories[parent] = elem;
					}
				}
			}).catch(function(response) {
				self.errorMessage = 'Unable to retrieve categories :(';
			});
		});

		function submit() {
			self.isSubmitting = true;
			if (!self.isFormErrors()) {
				self.uploadService.upload($scope.formData).then(function(data) {
					console.log(data);
				}).catch(function(response) {
					console.log(response);
					self.errorMessage = response.data.msg || response.data.msg.error;
					self.isSubmitting = false;
				});
			}
		}

		/**
		 * Check for form errors and change states if found.
		 * @event form submit
		 * @return {Boolean} true if errors.
		 */
		function isFormErrors() {
			var form = self.form;
			if (form.$invalid) {
				self.isSubmitting = false;
				self.nameError = form.name.$invalid;
				self.authorError = form.author.$invalid;
				self.descError = form.description.$invalid;
				self.expError = form.expansion.$invalid;
				self.categoryError = form.category.$invalid;
				return true;
			}

			return false;
		}

		/**
		 * Reset all form errors.
		 * @event form input click
		 */
		function resetError() {
			self.nameError = false;
			self.authorError = false;
			self.descError = false;
			self.expError = false;
			self.categoryError = false;
			self.errorMessage = false;
		}

		return self;
	}
};
