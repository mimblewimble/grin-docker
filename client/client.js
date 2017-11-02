const grinAPI = require('./grinapi'); 
let server_index=2;
const num_servers = 6;
const subnet = '172.26.0';
let server_containers = [];
let cur_tick=0;
const tick_length_ms = 1000;
//how frequently to check the head on all servers
const head_check_frequency = 60;
let next_head_check = head_check_frequency;


class ServerContainer {
	constructor(){
		this.ip = subnet+'.'+server_index;
		server_index++;
		this.start_params = grinAPI.serverStartParams();
		this.start_tick = 5;
		this.started=false;
		//percent chance of taking a break each tick
		this.break_chance=0;
		this.break_length=60;
		//percent chance of trying to send some coins each tick
		this.coin_send_chance=0;
		this.coin_send_amount=50000;
		this.coin_send_destination='172.26.0.2:13415';
		//wait a while before sending coins
		this.coin_send_min_tick = 60;
		this.coin_send_cooldown = 60;
	}

	start(){
		let ip = this.ip;
		let start_params = this.start_params;
		console.log('Attempting to start server at %s with params: %s', ip, JSON.stringify(start_params));
		let impl = function(){
			grinAPI.startServer(ip, start_params).then(function(res){
				console.log('Start server at %s. Response is: {%s} ', ip, res);
			}, function(err){
				console.log('Error contacting server at %s: %s', ip, err);
			}).catch(function(err){
				console.log('Client error: %s', err);
			});
		};
		impl();
	}

	stop(){
		let ip = this.ip;
		let impl = function(){
			grinAPI.stopServer(ip).then(function(res){
				console.log('Stopping server at %s. Response is: {%s} ', ip, res);
			}, function(err){
				console.log('Error contacting server at %s: %s', ip, err);
			}).catch(function(err){
				console.log('Client error: %s', err);
			});
		};
		impl();
	}

	queryChain(){
		let ip =this.ip;
		let impl = function(){
			return new Promise((resolve, reject) => {
				grinAPI.getChainState(ip).then(function(res){
					//console.log('Chain state at %s is: %s ', ip, res);
					resolve(JSON.parse(JSON.stringify(JSON.parse(res))));
				}, function(err){
					console.log('Error getting chain state: %s', err);
					reject(err);
				}).catch(function(err){
					console.log('Client error: %s', err);
					reject(err);
				});
			});
		};
		return impl();
	}

	//Main update function.... server will decide to do on any given
	//tick based on simple rules
	update(){
		// start when scheduled
		if (!this.started){
			if (cur_tick > this.start_tick){
				this.start();
				this.started=true;
			}
		}
		//To simulate nodes randomly joining and leaving
		if (this.started && this.break_chance > 0){
			let roll = Math.random()*100;
			//console.log('%s break roll: %d', this.ip, roll);
			if (roll < this.break_chance){
				console.log('%s shutting down for %d seconds', this.ip, this.break_length);
				this.stop();
				this.started=false;
				this.start_tick=cur_tick+this.break_length;
			}
		}
		//To simulate nodes sending coins to other nodes
		if (this.started && this.coin_send_chance > 0 && cur_tick>=this.coin_send_min_tick){
			let roll = Math.random()*100;
			//console.log('%s break roll: %d', this.ip, roll);
			if (roll < this.coin_send_chance){
				console.log('%s sending %d nanogrins to %s', this.ip, this.coin_send_amount, this.coin_send_destination);
				let params = grinAPI.walletSendParams();
				params.amount = this.coin_send_amount;
				params.destination = this.coin_send_destination;
				grinAPI.sendCoins(this.ip, params);
				//cool down before allowing again
				this.coin_send_min_tick += this.coin_send_cooldown;
			}
		}
	}
}

// Create references to servers
for (let i = 0; i<num_servers; i++){
	server_containers.push(new ServerContainer());
}

//Manually add some properties to each server
function tweak_servers(){
	//set up a miner seed, mining into a wallet
	server_containers[0].start_tick = 5;
	server_containers[0].coin_send_chance=1;
	server_containers[0].coin_send_amount=50000;
	server_containers[0].coin_send_destination='http://'+server_containers[5].ip+':13415';
	//set up another miner, also mining into a wallet, connecting to first
	server_containers[1].start_tick = 45;
	server_containers[1].start_params.serverargs = ['--mine', '--seed='+server_containers[0].ip+':13414', 'run'];
	server_containers[1].break_chance=1;
	//set up non-validating mining node, joining later, and connecting to another seed
	server_containers[2].start_tick = 120;
	server_containers[2].start_params.runwallet = false;
	server_containers[2].start_params.serverargs = ['--seed='+server_containers[1].ip+':13414', 'run'];
	server_containers[2].break_chance=0.5;
	server_containers[2].break_length=360;
	//And another non-validating one, a bit later, connect to another seed
	server_containers[3].start_tick = 180;
	server_containers[3].start_params.runwallet = false;
	server_containers[3].start_params.serverargs = ['--seed='+server_containers[2].ip+':13414', 'run'];
	//and another miner, joining later
	server_containers[4].start_tick = 240;
	server_containers[4].start_params.runwallet = true;
	server_containers[4].start_params.serverargs = ['--mine', '--seed='+server_containers[1].ip+':13414', 'run']; 
	server_containers[4].break_chance=2;
	server_containers[4].break_length=30;
	//here's a lucky wallet receiver
	server_containers[5].start_tick=15;
	server_containers[5].start_params.serverargs = ['--seed='+server_containers[0].ip+':13414', 'run'];
	server_containers[5].coin_send_chance=1;
	server_containers[5].coin_send_amount=50000;
	server_containers[5].coin_send_destination='http://'+server_containers[1].ip+':13415';
	server_containers[5].coin_send_min_tick=180;
}

function checkHeads(){
	let promises = [];
	console.log('Checking head state of running servers');
	for (let i in server_containers) {
		let c = server_containers[i];
		if (c.started){
			promises.push(c.queryChain());
		}
	}
	Promise.all(promises).then(values => {
		console.log(values);
		let control_height = values[0].height;
		let control_block = values[0].last_block_pushed;
		for (let i in values) {
			let v = values[i];
			if (v.height!=control_height || control_block!=v.last_block_pushed){
				console.log ('WARNING - - - differences found in server heights and/or last block pushed');
				break;
			}
		}
	});
}

function tick() {
	for (let server of server_containers){
		server.update();
	}
	if (cur_tick==next_head_check){
		checkHeads();
		next_head_check = cur_tick+head_check_frequency;
	}
	cur_tick++;
}

// Tick once a second
function run() {
	console.log('Applying server settings');
	tweak_servers();
	console.log('Starting main loop');
	setInterval(tick, tick_length_ms);
}

run();

