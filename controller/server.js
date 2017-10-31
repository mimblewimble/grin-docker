var HttpDispatcher = require('httpdispatcher');
var http           = require('http');
var dispatcher     = new HttpDispatcher();
var shell          = require('shelljs');

// define the port of access for the server
const PORT = 8080;

// global handle for the running grin instance
var grin_process;

// We need a function which handles requests and send response
function handleRequest(request, response){
	try {
		// log the request on console
		console.log(request.url);
		// Dispatch
		dispatcher.dispatch(request, response);
	} catch(err) {
		console.log(err);
	}
}

// Create a server
var grinControlServer = http.createServer(handleRequest);

var CommandResult = function(){
	return {
		command: 'none',
		result: 'failure'
	};
};

var GrinStatus = function(){
	return {
		status: 'stopped',
	};
};

// add some routes

//A sample GET request
/*dispatcher.onGet('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<h1>Hey, this is the homepage of your server</h1>');
});*/

var killGrin = function(){
	if (grin_process!=null){
		grin_process.kill('SIGTERM');
		console.log('Grin process killed');
	}
	grin_process=null;
};

var sendResponse = function(res, result){
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(result));
};

dispatcher.onGet('/start', function(req, res) {
	killGrin();
	grin_process = shell.exec('grin server run', {async:true});
	grin_process.stdout.on('data', function(data) {
		console.log(data);
	});
	grin_process.on('exit', function(data) {
		console.log('Exited with exit code: '+data);
		killGrin();
	});
	var result = CommandResult();
	result.command='start normal';
	result.result='issued';
	sendResponse(res, result);
});

dispatcher.onGet('/start-miner', function(req, res) {
	killGrin();
	grin_process = shell.exec('grin server --mine run', {async:true});
	grin_process.stdout.on('data', function(data) {
		console.log(data);
	});
	grin_process.on('exit', function(data) {
		console.log('Exited with exit code: '+data);
		killGrin();
	});
	var result = CommandResult();
	result.command='start miner';
	result.result='issued';
	sendResponse(res, result);
});

dispatcher.onGet('/stop', function(req, res) {
	killGrin();
	var result = CommandResult();
	result.command='stop grin';
	result.result='issued';
	sendResponse(res, result);
});

dispatcher.onGet('/status', function(req, res) {
	var result = GrinStatus();
	if (grin_process!=null&&grin_process.exit_code==null){
		result.status='running';
	}
	sendResponse(res, result);
});

dispatcher.onError(function(req, res) {
	res.writeHead(404);
	res.end('Error, the URL doesn\'t exist');
});

// Start the server !
grinControlServer.listen(PORT, function(){
	// Callback triggered when server is successfully listening. Hurray!
	console.log('Control server listening on: http://localhost:%s', PORT);
});
