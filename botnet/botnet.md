# Botnet - alternate way of controlling grin docker instances

This approach uses an alternate approach that enables more control over each running grin instance. Rather than
specify running paramters at the docker level, this just uses a single docker container that can be spawned
multiple times. Starting/stopping the server and wallet is done via POSTS to a listening node.js control server.

Idea here is that by controlling each grin instance manually, it will be easier to script a 'live'
network where nodes are constantly running, joining, leaving, etc. as well as check on their status 
via grin's API commands. Additionally, it should be easy enough to build a pretty-UI on top of 
the test net if so desired by adding a 'control' node that runs a simple control web-app.

Prereqs:
docker
docker-compose
node 8+

Build via:
```
docker-compose build
```

And launch the same number of instances as match what's specified in ../client/client.js

```
docker-compose up --scale grin-bot-node=6
```

This won't start grin automatically on each node, just a control server on each server, which will be accessed by the control client.

Wait for the nodes to come up, then to start the network simulation, from the ../client directory:

```
node client.js
```

This will start up the clients at intervals and start/stop them, or send transactions at intervals defined by the rules in client.js,
as well as periodically poll, collect and compare stats from each running server via their grin APIs.

To modify values or the frequency at which events have a chance of occurring, refer to the 'tweak_servers' function in client.js

Other misc: (Older, just here for testing and debuggin reference)

To start a server, POST via curl as follows

```
curl -X POST -d @sample_start.json 172.26.0.2:8000/start
```

Check parameter values in [sample_start.json](sample_start.json). You can choose to run either a wallet server,
a regular server or both on the same instance.

To stop running servers:

```
curl -X POST 172.26.0.2:8000/stop
```

To check the status of grin instances on a server
```
curl 172.26.0.2:8000/status
```

All commands will return a json result with the status of the previous command.
