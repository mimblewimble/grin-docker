#!/bin/bash
# This script is run once on first boot of the image
CONTAINER_ALREADY_STARTED="MWIXNET_FIRST_RUN_DONE"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    CONFIG_FILE="/home/grinuser/.grin/$GRIN_CHAIN_TYPE/mwixnet-config.toml"
    if [ -e $CONFIG_FILE ]; then
        rm $CONFIG_FILE
    fi
    if [ $GRIN_CHAIN_TYPE == "test" ];
    then
        mwixnet --testnet init-config
    else
        mwixnet init-config
    fi
fi

GRIN_NODE_URL_REPLACED=$(echo "$GRIN_NODE_URL" | sed 's/\//\\\//g')
GRIN_WALLET_URL_REPLACED=$(echo "$WALLET_OWNER_URL" | sed 's/\//\\\//g')
sed -i "s/.*grin_node_url.*/grin_node_url = \"$GRIN_NODE_URL_REPLACED\"/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/mwixnet-config.toml
sed -i "s/.*wallet_owner_url.*/wallet_owner_url = \"$GRIN_WALLET_URL_REPLACED\"/g" /home/grinuser/.grin/$GRIN_CHAIN_TYPE/mwixnet-config.toml
sed -i 's/.*grin_node_secret_path.*/grin_node_secret_path = "\/grin-node-home\/.grin\/test\/.foreign_api_secret"/g' /home/grinuser/.grin/$GRIN_CHAIN_TYPE/mwixnet-config.toml
sed -i 's/.*wallet_owner_secret_path.*/#wallet_owner_secret_path = "\/grin-wallet-home\/.grin\/test\/.owner_api_secret"/g' /home/grinuser/.grin/$GRIN_CHAIN_TYPE/mwixnet-config.toml

if [ $GRIN_CHAIN_TYPE == "test" ]; then
    RUST_BACKTRACE=full mwixnet --testnet --wallet_pass=$WALLET_PASSWORD
else
    mwixnet --wallet_pass=$WALLET_PASSWORD
fi
