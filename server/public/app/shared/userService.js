module.exports = function($http, $q, $timeout) {
	'use strict';

	var user = {
		loggedIn: false,
		fetchInfo: fetchInfo,
		fetchToken: fetchToken,
		login: login,
		logout: logout,
		register: register
	};

	/**
	 * Get username and role for user.
	 */
	function fetchInfo() {
		function clientLogout() {
			user.loggedIn = false;
			user.name = undefined;
			user.role = undefined;
		}

		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/secure/me',
				timeout: 8000
			}).then(function(response) {
				if (response.data.msg !== 'unauthorized') {
					user.loggedIn = true;
					user.name = response.data.msg.user;
					user.role = response.data.msg.role;
					$timeout(fetchInfo, 600000);
					resolve(response.data.msg);
				} else {
					clientLogout();
					reject('unauthorized');
				}
			}).catch(function(response) {
				clientLogout();
				reject('Failed to fetch info about user.');
			});
		});
	}

	/**
	 * Get cross-site request forgery token.
	 */
	function fetchToken() {
		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/secure/csrf',
				timeout: 8000
			}).then(function(response) {
				resolve(response.data.token);
			}).catch(function(response) {
				reject('Failed to fetch security token for your form.');
			});
		});
	}

	/**
	 * Authenticate user.
	 * @param {Object} data - POST request data
	 */
	function login(data) {
		if (!data) throw new Error('No data parameter given.');

		return $q(function(resolve, reject) {
			$http({
				method: 'POST',
				url: '/api/secure/login',
				data: data,
				timeout: 18000
			}).then(function(response) {
				user.loggedIn = true;
				user.name = response.data.msg.user;
				user.role = response.data.msg.role;
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			});
		});
	}

	/**
	 * Destroy user session.
	 */
	function logout() {
		user.loggedIn = false;
		user.name = undefined;
		user.role = undefined;

		return $q(function(resolve, reject) {
			$http({
				method: 'GET',
				url: '/api/secure/logout',
				timeout: 18000
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject('Failed destroying user session.');
			});
		});
	}

	/**
	 * Register user.
	 * @param {Object} data - POST request data
	 */
	function register(data) {
		if (!data) throw new Error('No data parameter given.');

		return $q(function(resolve, reject) {
			$http({
				method: 'POST',
				url: '/api/secure/register',
				data: data,
				timeout: 18000
			}).then(function(response) {
				resolve(response.data);
			}).catch(function(response) {
				reject(response);
			});
		});
	}

	fetchInfo();
	return user;
};
