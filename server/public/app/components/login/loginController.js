module.exports = function() {
	'use strict';

	angular.module('app').controller('LoginController', LoginController);
	LoginController.$inject = ['$scope', '$state', 'userService', 'Config', 'CacheFactory'];

	function LoginController($scope, $state, userService, Config, CacheFactory) {
		var self = this;
		self.CAPTCHA_KEY_PUBLIC = Config.captchaPublicKey;
		self.user = userService;
		self.isFormErrors = isFormErrors;
		self.resetError = resetError;
		self.submit = submit;
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

		// Cache captcha attempts
		if (!CacheFactory.get('login')) {
			CacheFactory.createCache('login', {
				deleteOnExpire: 'passive',
				maxAge: 86400000,
				storageMode: window.localStorage ? 'localStorage' : 'sessionStorage'
			});
		}
		var cache = CacheFactory.get('login');
		var attempts = cache.get('attempts') || 0;
		self.isCaptcha = cache.get('isCaptcha') || false;

		/**
		 * POST login request to API.
		 * @event form submit
		 */
		function submit() {
			self.isSubmitting = true;
			var gresponse = self.isCaptcha ? grecaptcha.getResponse() : null;
			$scope.formData.captchaResponse = gresponse;

			if (!self.isFormErrors()) {
				userService.login($scope.formData).then(function() {
					cache.put('attempts', 0);
					cache.put('isCaptcha', false);
					$state.go('home');
				}).catch(function(response) {
					self.isSubmitting = false;
					self.errorMessage = response.data.msg || response.data.msg.error || 'Unknown server error or timeout. Please refresh and try again.';
					if (self.isCaptcha) grecaptcha.reset();
					
					attempts += 1;
					cache.put('attempts', attempts);
					if (attempts >= 5) {
						cache.put('isCaptcha', true);
						self.isCaptcha = true;
					}
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
				self.userError = form.username.$invalid;
				self.passError = form.password.$invalid;
				return true;
			} else if (self.isCaptcha && !$scope.formData.captchaResponse) {
				self.isSubmitting = false;
				self.capError = true;
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
			self.capError = false;
			self.errorMessage = false;
		}

		// Cleanup
		$scope.$on('destroy', function() {
			if (self.isCaptcha) grecaptcha = undefined;
		});

		return self;
	}
};
