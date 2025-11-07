FROM python:3.10-bullseye

RUN mkdir /app
COPY ./app/. /app/.
WORKDIR /app

RUN apt-get -y update && \
apt-get -y upgrade && \
apt-get clean autoclean && \
apt-get -y autoremove

# install apt packages
RUN apt-get install -y curl

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
