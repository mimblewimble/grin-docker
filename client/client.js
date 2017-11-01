var grinAPI = require('./grinapi');

/*function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}*/

var params = grinAPI.serverStartParams();

var startServer = function(){
	grinAPI.startServer('172.26.0.2', params).then(function(res){
		console.log('Server response is: '+res);
	}, function(err){
		console.log('Error contacting server: '+err);
	});
};

var stopServer = function(){
	grinAPI.stopServer('172.26.0.2').then(function(res){
		console.log('Server response is: '+res);
	}, function(err){
		console.log('Error contacting server: '+err);
	});
};

var queryChain = function(){
	grinAPI.getChainState('172.26.0.2').then(function(res){
		console.log('Chain state is: '+res);
	}, function(err){
		console.log('Error getting chain state: '+err);
	});
};

//startServer();
stopServer();
//queryChain();

