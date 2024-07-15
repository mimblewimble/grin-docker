const ownerClient = require('./owner_api_client.js');

const port = process.env.OWNER_API_PORT || 3415;
const password = process.env.WALLET_PASSWORD || 'password';
const host = process.env.OWNER_API_HOST || 'host.docker.internal';

async function main() {
	ownerClient.initClient('http://' + host + ':' + port + '/v3/owner');
	let shared_key = await ownerClient.initSecure();

	let token = await ownerClient.openWallet(password, shared_key);
	if (token == null) {
		return
	}

	let info_response = await new ownerClient.JSONRequestEncrypted(2, 'retrieve_txs', {
		"token": token,
		"tx_id": null,
		"tx_slate_id": null,
		"refresh_from_node": true
	}).send(shared_key)

	try {
		let result = JSON.parse(info_response).result.Ok;
		console.log(result);
	} catch (e) {
		console.log(JSON.parse(info_response))
	}

	await ownerClient.closeWallet(shared_key, 3)
}



main();


