module.exports = function($http, $q) {
	'use strict';

	var factory = {
		//getToken: getToken,
		upload: upload
	};

	/*function getToken() {
		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/secure/uploadtoken',
				timeout: 18000
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			});
		});
	}*/

	function upload(data) {
		if (!data) throw new Error('no data given');

		return $q(function(resolve, reject) {
			$http({
				method: 'POST',
				url: '/api/secure/insertaddon',
				data: data
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			});
		});
	}

	return factory;
};