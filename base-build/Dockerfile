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
RUN wget https://github.com/OliveTin/OliveTin/releases/latest/download/OliveTin_linux_amd64.deb
RUN dpkg -i OliveTin_linux_amd64.deb

#######################
# DEPLOY              #
#######################
#Deploy binaries to a minimal image

#FROM debian:stretch
FROM grin_build
LABEL maintainer="yeastplume" description="Minimal Grin Node"
COPY --from=grin_build /usr/src/grin/target/release/grin /usr/bin/grin
RUN apt-get update && apt-get -y install curl
RUN useradd -m grinuser
RUN chown -R grinuser:grinuser /etc/OliveTin
COPY base-build/run_processes.sh /home/grinuser/run_processes.sh
USER grinuser
RUN mkdir -p /home/grinuser/.grin/main
# RUN chown -R grinuser:grinuser /home/grinuser/.grin
WORKDIR /home/grinuser/.grin/main
RUN grin server config
#RUN sed -i 's/.*file_log_level.*/file_log_level = "Trace"/g' /home/grinuser/.grin/main/grin-server.toml \
RUN sed -i 's/.*api_http_addr.*/api_http_addr = "0.0.0.0:13413"/g' /home/grinuser/.grin/main/grin-server.toml \
  && sed -i 's/.*host.*=.*/host = "0.0.0.0"/g' /home/grinuser/.grin/main/grin-server.toml \
  && sed -i 's/.*run_tui.*=.*/run_tui = false/g' /home/grinuser/.grin/main/grin-server.toml
WORKDIR /home/grinuser
ENV RUST_BACKTRACE=1
#RUN grin wallet init


ENTRYPOINT ["/home/grinuser/run_processes.sh"]
# forward log to docker log collector
RUN ln -sf /dev/stdout /home/grinuser/.grin/main/grin-server.log


