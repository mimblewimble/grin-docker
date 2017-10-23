#!/bin/bash
#just a helper script for cleaning all containers
docker ps -aq | xargs docker stop
docker ps -aq --no-trunc | xargs docker rm
