#!/bin/bash
docker exec devnet_grin-genesis-wallet_1 grin wallet -p "password" -a "http://grin-regular-1:13413" send 20000 -d "http://grin-regular-2-wallet:13416"
