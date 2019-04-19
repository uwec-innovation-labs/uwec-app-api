FROM node:10-alpine

LABEL name="uwec-app-api"

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install request --save

COPY . .

EXPOSE 4000

CMD ["npm", "start"]