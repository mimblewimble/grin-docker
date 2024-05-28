#######################
# BUILD               #
#######################

# Base build of grin docker image

#use official rust docker image (debian based)
FROM rust:latest as grin_build

# Grin node
# needs cmake
RUN apt-get update && apt-get -y install cmake clang
#RUN apt-get -y install libreadline-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev zlib1g-dev
#checkout source fresh and build
WORKDIR /usr/src
RUN git clone https://github.com/mimblewimble/grin.git
WORKDIR /usr/src/grin
RUN cargo build --release

# Olivetin - for basic web gui to run simple monitoring commands
#RUN wget https://github.com/OliveTin/OliveTin/releases/latest/download/OliveTin_linux_amd64.deb
#RUN dpkg -i OliveTin_linux_amd64.deb

#######################
# DEPLOY              #
#######################
#Deploy binaries to a minimal image

FROM grin_build as grin_node_mainnet
LABEL maintainer="yeastplume" description="Minimal Grin Node"
COPY --from=grin_build /usr/src/grin/target/release/grin /usr/bin/grin
RUN useradd -m grinuser
USER grinuser
RUN mkdir -p /home/grinuser/.grin/main
WORKDIR /home/grinuser/.grin/main
RUN grin server config
RUN sed -i 's/.*api_http_addr.*/api_http_addr = "0.0.0.0:3413"/g' ./grin-server.toml \
  && sed -i 's/.*host.*=.*/host = "0.0.0.0"/g' ./grin-server.toml \
  && sed -i 's/.*run_tui.*=.*/run_tui = false/g' ./grin-server.toml

WORKDIR /home/grinuser

#USER root
#RUN ln -s /home/grinuser/.grin/main /node-secrets
#RUN cp /home/grinuser/.grin/main/.api_secret /home/grinuser/node/.api_secret
#RUN cp /home/grinuser/.grin/main/.foreign_api_secret /home/grinuser/node/.foreign_api_secret

ENTRYPOINT ["/usr/bin/grin"]
# forward log to docker log collector
RUN ln -sf /dev/stdout /home/grinuser/.grin/main/grin-server.log

# Add wallet
#FROM grin_node_base as grin_node_wallet
#LABEL maintainer="yeastplume" description="Minimal Grin Node + Wallet Installation"
#USER root
#WORKDIR /usr/src
#RUN git clone https://github.com/mimblewimble/grin-wallet.git
#WORKDIR /usr/src/grin-wallet
#RUN cargo build --release
#RUN cp /usr/src/grin-wallet/target/release/grin-wallet /usr/bin/grin-wallet
#USER grinuser
#COPY base-build/run_processes_add_wallet.sh /home/grinuser/run_processes.sh
#RUN grin-wallet -p password init 




