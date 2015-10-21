

// Initialize Javascript global namespace.
var ca = {};
ca.crypto = {};
ca.crypto.research = {};

/**
*  Crypto Research Project Util functions.
*  <p>
*  Core functions required by all client scripts.
*/
ca.crypto.research.Utils = (function () {
	'use strict';
	
	var serverAddress
		;
	
	return {
		setServerAddress: function(hostName) {
			serverAddress = hostName;
			console.log('Set server address: ' + serverAddress);
		},
		getServerAddress: function() {
			return serverAddress;
		},
		pingServer: function(callback) {
			console.log(serverAddress);
			if (!serverAddress) {
				callback([404, 'Server address not initialized']);
				return;
			}
			$.ajax({
				'type': 'GET',
				'url': serverAddress + '/joinGroup',
				'success': callback,
				'error': callback
			});
		}
	};
})();

