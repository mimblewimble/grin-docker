const ownerClient = require('./owner_api_client.js');

const port = process.env.OWNER_API_PORT || 3415;
const password = process.env.WALLET_PASSWORD || 'password';

async function main() {
	let client = ownerClient.initClient('http://host.docker.internal:' + port + '/v3/owner');
	let shared_key = await ownerClient.initSecure();

	let response = await new ownerClient.JSONRequestEncrypted(1, 'create_wallet', {
		"name": null,
		"mnemonic": null,
		"mnemonic_length": 32,
		"password": password
	}).send(shared_key);

	console.log("Response: ", response);
}



main();


