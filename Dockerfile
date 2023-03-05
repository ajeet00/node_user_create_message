FROM node:lts-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN apk --update add redis    
WORKDIR /usr/src/app

COPY package*.json .

RUN npm install
RUN npm install -g pm2

COPY . .

EXPOSE 3002
CMD [ "npm", "start"]
