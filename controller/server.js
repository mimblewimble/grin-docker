var HttpDispatcher = require('httpdispatcher');
var http           = require('http');
var dispatcher     = new HttpDispatcher();
const { spawn }    = require('child_process');

// define the port of access for the server
const PORT = 8000;
const GRIN_CMD = 'grin';
//const GRIN_CMD = '../../grin/target/debug/grin';

// global handle for the running grin instance
var server_process;
var wallet_process;

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
		server_process: 'stopped',
		wallet_process: 'stopped'
	};
};

// add some routes

//A sample GET request
/*dispatcher.onGet('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('<h1>Hey, this is the homepage of your server</h1>');
});*/

var killGrin = function(){
	if (server_process!=null){
		server_process.kill('SIGINT');
		console.log('SIGINT sent to grin server process');
	}
	if (wallet_process!=null){
		wallet_process.kill('SIGINT');
		console.log('SIGINT sent to grin wallet process');
	}
	server_process=null;
	wallet_process=null;
};

var sendResponse = function(res, result){
	res.writeHead(200, {'Content-Type': 'application/json'});
	res.end(JSON.stringify(result));
};

dispatcher.onPost('/start', function(req, res) {
	killGrin();
	try {
		var args=JSON.parse(req.body);
		if (args.runserver){
			console.log('Starting server');
			args.serverargs.unshift('server');
			server_process = spawn(GRIN_CMD, args.serverargs);
			server_process.stdout.on('data', function(data) {
				console.log(data);
			});
			server_process.on('exit', function(code) {
				console.log('Server Exited with exit code: '+code);
				server_process=null;
			});
			server_process.on('error', function(err){
				console.log(err);
			});
		}
		if (args.runwallet){
			console.log('Starting wallet');
			args.walletargs.unshift('wallet');
			wallet_process = spawn(GRIN_CMD, args.walletargs, {cwd: './wallet'});
			wallet_process.stdout.on('data', function(data) {
				console.log(data);
			});
			wallet_process.on('exit', function(code) {
				console.log('Wallet exited with exit code: '+code);
				server_process=null;
			});
			wallet_process.on('error', function(err){
				console.log(err);
			});
		}
		var result = CommandResult();
		result.command='start';
		result.result='issued';
		sendResponse(res, result);
	} catch (err){
		var result_err = CommandResult();
		result_err.command='start';
		result_err.result='error';
		sendResponse(res, result_err);
		console.log(err);
	}
});

dispatcher.onPost('/stop', function(req, res) {
	killGrin();
	var result = CommandResult();
	result.command='stop grin';
	result.result='issued';
	sendResponse(res, result);
});

dispatcher.onGet('/status', function(req, res) {
	var result = GrinStatus();
	if (server_process!=null&&server_process.exit_code==null){
		result.server_process='running';
	}
	if (wallet_process!=null&&wallet_process.exit_code==null){
		result.wallet_process='running';
	}
	sendResponse(res, result);
});

dispatcher.onError(function(req, res) {
	res.writeHead(404);
	res.end('Error, the URL doesn\'t exist');
});

// Start the server !
grinControlServer.listen(PORT, '0.0.0.0', function(){
	// Callback triggered when server is successfully listening. Hurray!
	console.log('Control server listening on: http://' + grinControlServer.address().address + ':' + PORT);
});
