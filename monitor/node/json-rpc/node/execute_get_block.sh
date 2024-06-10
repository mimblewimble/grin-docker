#!/bin/bash
GET_BLOCK_REQ=$(/usr/bin/envsubst < /etc/OliveTin/json-rpc/node/get_block.json)
curl -s -X POST host.docker.internal:$NODE_API_PORT/v2/foreign -u grin:`cat /grin-node-home/.grin/$NODE_CHAIN_TYPE/.foreign_api_secret` --data "${GET_BLOCK_REQ}"