module.exports = function() {
	'use strict';

	angular.module('app').controller('RegisterController', RegisterController);
	RegisterController.$inject = ['$scope', '$state', 'userService', 'Config'];

	function RegisterController($scope, $state, userService, Config) {
		var self = this;
		self.CAPTCHA_KEY_PUBLIC = Config.captchaPublicKey;
		self.user = userService;
		self.submit = submit;
		self.resetError = resetError;
		self.isFormErrors = isFormErrors;
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
		 * POST register request to API.
		 * @event form submit
		 */
		function submit() {
			self.isSubmitting = true;
			$scope.formData.captchaResponse = grecaptcha.getResponse();

			if (!self.isFormErrors()) {
				userService.register($scope.formData).then(function(res) {
					alert('Account created! Redirecting you to login page.');
					$state.go('login');
				}).catch(function(res) {
					self.isSubmitting = false;
					self.errorMessage = res.data.msg || res.data.msg.error || 'Unknown server error or timeout. Please refresh and try again.';
					grecaptcha.reset();
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
				self.userError = form.username.$invalid;
				self.passError = form.password.$invalid;
				self.repassError = form.repassword.$invalid || $scope.formData.password !== $scope.formData.repassword;
				self.isSubmitting = false;
				return true;
			} else if (!$scope.formData.captchaResponse) {
				self.capError = true;
				self.isSubmitting = false;
				return true;
			}

			return false;
		}

		/**
		 * Reset all form errors.
		 * @event form input click
		 */
		function resetError() {
			self.userError = false;
			self.passError = false;
			self.repassError = false;
			self.errorMessage = false;
		}

		// Cleanup
		$scope.$on('destroy', function() {
			grecaptcha = undefined;
		});

		return self;
	}
};
