#!/bin/bash
# This script is run once on first boot of the image
CONTAINER_ALREADY_STARTED="WALLET_FIRST_RUN_DONE"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    if [ $GRIN_CHAIN_TYPE == "test" ];
    then
        RUST_BACKTRACE=full grin-wallet --testnet init 
    else
        grin-wallet init 
    fi
fi

GRIN_NODE_URL_REPLACED=$(echo "$NODE_API_HTTP_ADDR" | sed 's/\//\\\//g')
NODE_API_SECRET_PATH_REPLACED=$(echo "$NODE_API_SECRET_PATH" | sed 's/\//\\\//g')
sed -i "s/.*check_node_api_http_addr.*/check_node_api_http_addr = \"$GRIN_NODE_URL_REPLACED\"/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/grin-wallet.toml
sed -i "s/.*node_api_secret_path.*/node_api_secret_path = \"$NODE_API_SECRET_PATH_REPLACED\"/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/grin-wallet.toml
sed -i "s/.*owner_api_listen_port.*/owner_api_listen_port = $OWNER_API_LISTEN_PORT/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/grin-wallet.toml
sed -i "s/api_listen_port.*/api_listen_port = $WALLET_API_LISTEN_PORT/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/grin-wallet.toml
# hack to avoid complicated sed command
sed -i "s/.*#tls_certificate_key.*/owner_api_listen_interface = \"$OWNER_API_LISTEN_INTERFACE\"/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/grin-wallet.toml

if [ $GRIN_CHAIN_TYPE == "test" ]; then
    RUST_BACKTRACE=full grin-wallet --testnet owner_api --run_foreign
else
    grin-wallet owner_api --run_foreign
fi