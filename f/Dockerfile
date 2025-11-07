FROM node:20-bullseye

WORKDIR /app

RUN apt-get -y update && \
apt-get -y upgrade && \
apt-get clean autoclean && \
apt-get -y autoremove

# install apt packages
RUN apt-get install -y curl

