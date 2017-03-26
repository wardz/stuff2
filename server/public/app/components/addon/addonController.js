module.exports = function() {
	'use strict';

	angular.module('app').controller('AddonController', AddonController);
	AddonController.$inject = ['$stateParams', 'addonService', 'userService'];

	function AddonController($stateParams, addonService, userService) {
		var self = this;
		self.user = userService;
		self.addonService = addonService;
		self.download = download;
		var expansion = $stateParams.expID;
		var addon = $stateParams.addonName;

		self.addonService.fetch(expansion, addon).then(function(data) {
			self.addon = data.msg[0];
		}).catch(function(response) {
			console.log(response);
		});
		
		function download() {

		}

		return self;
	}
};
