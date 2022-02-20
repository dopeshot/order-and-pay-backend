FROM node:16 as dev

RUN mkdir -p /home/node/oap-backend
RUN chown -R node:node /home/node/oap-backend
WORKDIR /home/node/oap-backend

EXPOSE 3000

FROM dev as submission

# install netcat for waiter
# running this here allows the container to be run as a non-root user
RUN apt-get update && apt-get install -y netcat


#copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

#install dependencies
RUN npm install

#copy source
COPY --chown=node:node . .

USER node

RUN npm run build

FROM submission as full

CMD ["npm", "run", "start:prod"]