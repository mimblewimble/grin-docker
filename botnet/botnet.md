#Botnet - alternate way of controlling grin docker instances

This approach uses an alternate approach that enables more control over each running grin instance. Rather than
specify running paramters at the docker level, this just uses a single docker container that can be spawned
multiple times. Starting/stopping the server and wallet is done via POSTS to a listening node.js control server.

Idea here is that by controlling each grin instance manually, it will be easier to script a 'live'
network where nodes are constantly running, joining, leaving, etc. as well as check on their status 
via grin's API commands. Additionally, it should be easy enough to build a pretty-UI on top of 
the test net if so desired by adding a 'control' node that runs a simple control web-app.

Build via:
```
docker-compose build
```

And launch as many instances as you want with:

```
docker-compose up --scale grin-bot-node=10
```

This won't start grin automatically on each node, just a control server which can be controlled as follows.
The first container starts with IP 172.26.0.2 and increments each instance from there.


To start, POST via curl as follows

```
curl -X POST -d @sample_start.json 172.26.0.2:8000/start
```

Check parameter values in [sample_start.json] (sample_start.json). You can choose to run either a wallet server,
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
