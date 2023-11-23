FROM node

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install -g npm@8.19.3

RUN npm install

COPY . /usr/src/app

EXPOSE 3000

CMD [ "npm", "start" ]
