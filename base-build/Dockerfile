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

WORKDIR /home/grinuser

ENTRYPOINT ["/usr/bin/grin"]
# forward log to docker log collector
RUN ln -sf /dev/stdout /home/grinuser/.grin/main/grin-server.log