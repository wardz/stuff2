module.exports = function() {
	'use strict';

	angular.module('app').controller('AccountController', AccountController);
	AccountController.$inject = ['addonService', 'userService'];

	function AccountController(addonService, userService) {
		var self = this;
		self.user = userService;
		
		//console.log('ran');
		return self;
	}
};
