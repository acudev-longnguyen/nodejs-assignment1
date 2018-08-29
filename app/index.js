/*
* Primary file
*
*/

// Dependencies
const http = require('http');
const https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate HTTP server
var httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
});

//start HTTP server and listen to 3000 port
httpServer.listen(config.httpPort, function() {
	console.log('running and listening on port %s', config.httpPort);
});

// Instantiate HTTPS server
var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem'),
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
});

//start HTTP server and listen to 3000 port
httpsServer.listen(config.httpsPort, function() {
	console.log('running and listening on port %s', config.httpsPort);
});

// Handle server logic for http and https server
var unifiedServer = function(req, res) {
	// parse url
	var parsedUrl = url.parse(req.url, true);

	// extract path
	var reqPath = parsedUrl.pathname;
	var trimmedPath = reqPath.replace(/^\/+|\/+$/g,'');

	// get query string as an object
	var queryStringObject = parsedUrl.query;

	// get request HTTP Method
	var method = req.method.toLowerCase();

	// get the headers as an object
	var headers = req.headers;

	// get payload
	var decoder = new StringDecoder('utf-8');
	var buffer = '';

	req.on('data', function(data) {
		buffer += decoder.write(data);
	});

	req.on('end', function() {
		buffer += decoder.end();

		//choose handler this request should go to, if one is not found use not found handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 

		// Construct data object to send to handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request to the chosen handler
		chosenHandler(data, function(statusCode, payload) {
			// use the status code defaulted by handler or default by 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			// use the payload calledback by the handler or default by {}
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert payload to string
			var payloadString = JSON.stringify(payload);

			// Return response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

		});
	});
};

// Define router handler
var handlers = {};

// Sample handler
handlers.sample = function(data, callback) {
	// callback http status code, and a payload object
	callback(406, data);
};

handlers.ping = function(data, callback) {
	callback(200);
};

handlers.greeting = function(data, callback) {
	var payload = typeof(data.payload) == 'string' ? JSON.parse(data.payload) : {};
	var greetingString = "Hello"; 



	if (payload.name) {
		greetingString = greetingString + ", " + payload.name;
	}

	var customData = {
		'greetingMessage' : greetingString
	};

	callback(200, customData);
};

// Not found handler
handlers.notFound = function(data, callback) {
	callback(404);
};


// Define request router
var router = {
	'sample' : handlers.sample,
	'ping' : handlers.ping,
	'hello' : handlers.greeting
};