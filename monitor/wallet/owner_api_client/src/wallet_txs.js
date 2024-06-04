const ownerClient = require('./owner_api_client.js');

const port = process.env.OWNER_API_PORT || 3415;

async function main() {
	let client = ownerClient.initClient('http://host.docker.internal:' + port + '/v3/owner');
	let shared_key = await ownerClient.initSecure();

	let response = await new ownerClient.JSONRequestEncrypted(1, 'open_wallet', {
		"name": null,
		"password": "password",
	}).send(shared_key);

	let token = JSON.parse(response).result.Ok;

	let info_response = await new ownerClient.JSONRequestEncrypted(2, 'retrieve_summary_info', {
		"token": token,
		"refresh_from_node": true,
		"minimum_confirmations": 1,
	}).send(shared_key)

	let result = JSON.parse(info_response).result.Ok;
	console.log(result);

	info_response = await new ownerClient.JSONRequestEncrypted(3, 'close_wallet', {
		"name": null,
	}).send(shared_key)
}



main();


