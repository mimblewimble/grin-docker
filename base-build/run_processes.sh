#!/bin/bash

# Start the second process
/usr/local/bin/OliveTin &

# Start the first process
/usr/bin/grin server run &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?