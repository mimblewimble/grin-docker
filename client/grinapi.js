var request=require('request');

class ServerStartParams {
	constructor(){
		this.runserver = true;
		this.runwallet = true;
		this.serverargs = ['--mine', 'run'],
		this.walletargs = ['-p', 'password', 'receive'];
	}
}

class PostOptions {
	constructor(){
		this.url= 'http://172.26.0.2:8000/start';
		this.method= 'POST';
		this.headers= {
			'Accept': 'application/json',
			'Accept-Charset': 'utf-8',
			'User-Agent': 'grin-client'
		},
		this.body=JSON.stringify(new ServerStartParams());
	}
}

const serverStartParams = function(){
	return new ServerStartParams();
};

const startServer = function(ip, server_params){
	var post_options = new PostOptions();
	post_options.url = 'http://'+ip+':8000/start';
	post_options.body = JSON.stringify(server_params);
	return new Promise(function(resolve, reject) {
		request(post_options, function (err, res, body) {
			if (err) {
				reject(Error(err));
			}
			resolve(body);
		});
	});
};

const stopServer = function(ip){
	var post_options = new PostOptions();
	post_options.url = 'http://'+ip+':8000/stop';
	return new Promise(function(resolve, reject) {
		request(post_options, function (err, res, body) {
			if (err) {
				reject(Error(err));
			}
			resolve(body);
		});
	});
};

const getChainState = function(ip){
	var post_options = new PostOptions();
	post_options.url = 'http://'+ip+':13413/v2/chain';
	post_options.method = 'GET';
	return new Promise(function(resolve, reject) {
		request(post_options, function (err, res, body) {
			if (err) {
				reject(Error(err));
			}
			resolve(body);
		});
	});
};

module.exports = function(){
	return {
		serverStartParams : serverStartParams,
		startServer : startServer,
		stopServer : stopServer,
		getChainState : getChainState,
	};
}();
