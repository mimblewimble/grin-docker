const ownerClient = require('./owner_api_client.js');

async function main() {
	let client = ownerClient.initClient('http://host.docker.internal:3415/v3/owner');
	let shared_key = await ownerClient.initSecure();

	/*let response = await new JSONRequestEncrypted(1, 'open_wallet', {
		"name": null,
		"password": "",
	}).send(shared_key);

	let token = JSON.parse(response).result.Ok;

	let iterations = 1;

	for (i=0; i<iterations*2; i+=2)  {
		let info_response = await new JSONRequestEncrypted(i, 'retrieve_summary_info', {
			"token": token,
			"refresh_from_node": true,
			"minimum_confirmations": 1,
		}).send(shared_key)

		console.log("Info Response: ", info_response);
		await sleep(2000)

		let txs_response = await new JSONRequestEncrypted(i+1, 'retrieve_txs', {
			"token": token,
			"refresh_from_node": true,
			"tx_id": null,
			"tx_slate_id": null,
		}).send(shared_key)

		console.log("Txs Response: ", txs_response);
		await sleep(2000)
	}*/
}



main();


