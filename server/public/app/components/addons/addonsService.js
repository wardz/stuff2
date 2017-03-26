module.exports = function($http, $q) {
	var factory = {
		browse: getAddons,
		fetch: getAddonInfo,
		search: search
	}

	function getAddons(expansion, category, page) {
		var query = '?category=' + category + '&page=' + page;
		
		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/v1/browse/' + expansion + query,
				cache: true
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			});
		});
	}

	function getAddonInfo(expansion, addon) {
		addon = encodeURIComponent(addon);

		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/v1/fetch/' + expansion + '/' + addon,
				cache: true
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			})
		});
	}

	function search(expansion, addon) {
		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/v1/search/' + expansion + '/' + addon,
				cache: true
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			})
		});
	}

	return factory;
};
