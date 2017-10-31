// require the http module of node.js
var http = require('http');

// define the port of access for your server
const PORT = 8080;

// We need a function which handles requests and send response
function handleRequest(request, response){
	response.end('Server working properly. Requested URL : ' + request.url);
}

// Create a server
var myFirstServer = http.createServer(handleRequest);

// Start the server !
myFirstServer.listen(PORT, function(){
	// Callback triggered when server is successfully listening. Hurray!
	console.log('Server listening on: http://localhost:%s', PORT);
});
