# Build and testing

(This is developer documentation)

## Basic usage

Install docker, docker-compose. Be in this directory.

To build the base image:
```
docker-compose build
```
This will build a docker image called grin-min

To run (attached to terminal)

```
docker-compose up
```

This will start networks, containers using the images, and log everything to the consolw

To run detached:
```
docker-compose up -d
```
Then check logs with
```
docker-compose logs
```
or
```
docker-compose logs grin-genesis (e.g.)
```
to get logs from a particular container

Detaching from the console via ctrl-c (when not running with -d) will stop the containers. Another
docker-compose up command will continue where they left off.

```
docker-compose down
```

Will reset and remove all containers.. you'll be starting with a blank slate again.


Now, to run many instances of miners and regular nodes:

```
docker-compose up --scale grin-miner=5 --scale grin-validator=20 -d
```
for example.

## other handy commands

execute and atach to a shell inside a partiuclar container as root
```
docker exec -u 0 -it grindocker_grin-wallet_1 /bin/bash
```

delete all images (to rebuild from scratch)
```
docker rmi $(docker images -q)
```

