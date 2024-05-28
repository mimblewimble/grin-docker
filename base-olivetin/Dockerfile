#######################
# BUILD               #
#######################

# Olivetin - for basic web gui to run simple monitoring commands

FROM debian:latest as olivetin_grin_build

RUN apt-get update && apt-get -y install curl && apt-get -y install wget
RUN wget https://github.com/OliveTin/OliveTin/releases/latest/download/OliveTin_linux_amd64.deb
RUN dpkg -i OliveTin_linux_amd64.deb

#######################
# DEPLOY CONFIG       #
#######################

ENTRYPOINT ["/usr/local/bin/OliveTin"]