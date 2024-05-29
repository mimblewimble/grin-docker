#!/bin/bash
curl -s -X POST host.docker.internal:$NODE_API_PORT/v2/owner -u grin:`cat /grin-node-home/.grin/$NODE_CHAIN_TYPE/.api_secret` -d @/etc/OliveTin/json-rpc/node/get_status.json