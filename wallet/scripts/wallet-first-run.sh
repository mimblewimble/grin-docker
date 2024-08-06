#!/bin/bash
# This script is run once on first boot of the image
CONTAINER_ALREADY_STARTED="WALLET_FIRST_RUN_DONE"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    echo "-- First container startup --"
    if [ $GRIN_CHAIN_TYPE == "test" ];
    then
        echo $WALLET_PASSWORD | echo $WALLET_PASSWORD |  RUST_BACKTRACE=full grin-wallet --testnet init 
    else
        echo $WALLET_PASSWORD | echo $WALLET_PASSWORD |  grin-wallet init 
    fi
fi

if [ $GRIN_CHAIN_TYPE == "test" ]; then
    RUST_BACKTRACE=full grin-wallet --testnet owner_api --run-foreign
else
    grin-wallet owner_api --run-foreign
fi