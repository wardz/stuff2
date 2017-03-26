module.exports = function($http, $q, CacheFactory) {
	'use strict';

	var factory = {
		getCategories: getCategories,
		getCategoryIds: getCategoryIds
	};

	if (!CacheFactory.get('categories')) {
		CacheFactory.createCache('categories', {
			deleteOnExpire: 'passive',
			maxAge: 604800000, // 1 week
			storageMode: window.localStorage ? 'localStorage' : 'sessionStorage'
		});
	}

	var cache = CacheFactory.get('categories');

	function getCategories(expansion) {
		if (!expansion) throw new Error('No parameter given.');

		return $q(function(resolve, reject) {
			var cached = cache.get(expansion);
			if (cached) return resolve(cached);

			$http({
				method: 'GET',
				url: '/api/v1/categories/' + expansion,
				timeout: 18000
			}).then(function(response) {
				var all = {};
				all.subcategories = {};
				all.categories = response.data.categories;
				var responseSubs = response.data.subcategories;
				if (!responseSubs || !all.categories) return {};
				all.categories.unshift({id: 0, name: 'All addons'});

				// build subcategories list based on parents
				for (var i = 0, n = responseSubs.length; i < n; i++) {
					var ele = responseSubs[i];
					if (!all.subcategories[ele.pname]) {
						all.subcategories[ele.pname] = [];
					}

					all.subcategories[ele.pname].push(ele);
				}

				cache.put(expansion, all);
				resolve(all);
			}).catch(function(response) {
				reject(response);
			});
		});
	}

	function getCategoryIds(expansion) {
		if (!expansion) throw new Error('No parameter given.');

		return $q(function(resolve, reject) {
			var cached = cache.get(expansion + 'id');
			if (cached) return resolve(cached);

			getCategories(expansion).then(function(categories) {
				var all = {};
				all.subcategories = {};
				all.categories = {};

				for (var item in categories.subcategories) {
					var elem = categories.subcategories[item];
					
					for (var i = 0, n = elem.length; i < n; i++) {
						var parent = elem[i].id;
						all.subcategories[parent] = elem[i].name;
					}
				}

				var cat = categories.categories;
				for (var i = 0, n = cat.length; i < n; i++) {
					var parent = cat[i].id;
					all.categories[parent] = cat[i].name;
				}

				cache.put(expansion + 'id', all);
				resolve(all);
			}).catch(function(response) {
				reject(response)
			});
		});
	}

	return factory;
};
