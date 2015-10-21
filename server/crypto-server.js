/**
	CRYPTO NODE SERVER
	<p>
	Root file for starting the CryptoNodeServer, and handling
	requests from clients.
*/

var express = require('express'),
	//Controller = require('./crypto-controller.js'),
	app = express(),
	server;
	
const PORT = 8080;
	
app.use(function(req, res, next) {
	'use strict';
  	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
});

app.get('/joinGroup', function(req, res) {
	'use strict';
	let status = '200';
	res.end(status);
});

app.get('/requestWork', function(req, res) {
	'use strict';

});

server = app.listen(PORT, function () {
	'use strict';
	//let controller = new Controller();
	console.log('Server up an running');
});
