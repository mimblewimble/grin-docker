#!/bin/bash
curl -s -X POST $NODE_API_ADDR/v2/owner -u grin:`cat /grin-node-home/.grin/$NODE_CHAIN_TYPE/.api_secret` -d @/etc/OliveTin/json-rpc/node/get_status.json