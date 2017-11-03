var HttpDispatcher  = require('httpdispatcher');
var http            = require('http');
var dispatcher      = new HttpDispatcher();
const {exec, spawn} = require('child_process');

// define the port of access for the server
const PORT = 8000;
const GRIN_CMD = 'grin';
//const GRIN_CMD = '../../grin/target/debug/grin';

// global handle for the running grin instance
var server_process;
var wallet_process;
var send_process;

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
			server_process = spawn(GRIN_CMD, args.serverargs, {env: {RUST_BACKTRACE: '1'}});
			server_process.stdout.on('data', function(data) {
				console.log(data);
			});
			server_process.stderr.on('readable', function() {
				var chunk;
				while ((chunk = this.read()) !== null) {
					console.log('%s', chunk);
				}
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
			wallet_process = spawn(GRIN_CMD, args.walletargs, {cwd: './wallet', env: {RUST_BACKTRACE: '1'}});
			wallet_process.stdout.on('data', function(data) {
				console.log(data);
			});
			wallet_process.stderr.on('readable', function() {
				var chunk;
				while ((chunk = this.read()) !== null) {
					console.log('%s', chunk);
				}
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

dispatcher.onPost('/send', function(req, res) {
	try {
		var args=JSON.parse(req.body);
		console.log('Sending Coins');
		args.unshift('wallet');
		console.log(args);
		send_process = spawn(GRIN_CMD, args, {cwd: './wallet', env: {RUST_BACKTRACE: '1'}});
		send_process.stdout.on('data', function(data) {
			console.log(data);
		});
		send_process.stderr.on('readable', function() {
			var chunk;
			while ((chunk = this.read()) !== null) {
				console.log('%s', chunk);
			}
		});
		send_process.on('exit', function(code) {
			console.log('Wallet send exited with exit code: '+code);
			send_process=null;
		});
		send_process.on('error', function(err){
			console.log(err);
		});
		var result = CommandResult();
		result.command='send';
		result.result='issued';
		sendResponse(res, result);
	} catch (err){
		var result_err = CommandResult();
		result_err.command='send';
		result_err.result='error';
		sendResponse(res, result_err);
		console.log(err);
	}
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
  // Init the wallet seed
  exec(GRIN_CMD + " wallet init", {cwd: './wallet', env: {RUST_BACKTRACE: '1'}});
	// Callback triggered when server is successfully listening. Hurray!
	console.log('Control server listening on: http://' + grinControlServer.address().address + ':' + PORT);
});
