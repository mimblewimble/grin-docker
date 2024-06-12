# Grin Docker images

(Internal developer documentation for now)

# Build and testing

## Basic usage

Install docker. Docker images first need to be build using *docker-compose build* and subsequently can be run using *docker-compose up -d*
To build a docker image, go to a directory that contains a *docker-compose.yml* file and run *docker-compose* within that directory.
The list of directories below contain a *docker-compose.yml* to build you docker image from.

`node/main` -> Builds and deploys a mainnet node from grin latest master
`node/test` -> Builds and deploys a testnet node from grin latest master
`wallet/main/contracts` -> Builds and deploys a mainnet wallet communicating with a node deployed by `node/main`
`monitor/main` -> Build and deploys an monitor node based on OliveTin allowing user to run node commands via a web gui
`monitor/test` -> As above, but against testnet.

Images are in the middle of being updated to 'modern Grin' (5.4.0+), and currently working compose files are:
For now, a typical workflow would be:

```
cd node/main
docker-compose build
docker-compose up -d
cd ../../monitor/node/main
docker-compose up -d
```

This will start a mainnet node, and present a (still rudimentary) web interface allowing the user to check the node sync status at `http://localhost:1337/`

The docker file at `wallet/main/contracts` currently runs a wallet built with the contracts branch, and exposes the owner and foreign APIs to other services in the docker context. Samples of how to access this are in `monitor/wallet/owner_api_client`, and these services will be built into an OliveTin monitor application to allow deployers to create, manage and query wallet instances.

## Other Notes

* All containers are stateless, containing no user-specific data within the images themselves. The docker-compose files create separate volumes for user-specific data such as node sync and wallet data. Other deployments in the context can then mount these volumes to share api secrets, etc. This also means that data on volumes persists unless explicitly deleted (so no need to re-sync if you delete and rebuild a container.)
* All compose files currently assume they're running in the same docker context, next steps will be using Kubernetes to allow deployments in more flexible configuations.
* Containers for running mwmixnet nodes will be added shortly, allowing for quick startup and teardown of testing mwixnet networks, (which require 3 separate instances ideally talking to 3 separate wallets). 

## Handy Commands

To build images, as defined by the docker compose files in these directories
```
docker-compose build
```
This will build a docker image called grin-min

To run (attached to terminal)

```
docker-compose up
```

This will start networks, containers using the images, and log everything to the console.

To run detached:
```
docker-compose up -d
```
Then check logs with
```
docker-compose logs
```

Detaching from the console via ctrl-c (when not running with -d) will stop the containers. Another
docker-compose up command will continue where they left off.

```
docker-compose down
```

Will reset and remove all containers. Volumes should be maintained.

## other handy commands

Execute and attach to a shell inside a particular container as root:
```
docker exec -u 0 -it grindocker_grin-wallet_1 /bin/bash
```

Delete all images (to rebuild from scratch):
```
docker rmi $(docker images -q)
```

