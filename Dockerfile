FROM node:16 as dev

RUN mkdir -p /home/node/oap-backend
RUN chown -R node:node /home/node/oap-backend
WORKDIR /home/node/oap-backend

EXPOSE 3000

FROM dev as full

#copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

#install dependencies
RUN npm install

#copy source
COPY --chown=node:node . .

USER node

RUN npm run build

CMD ["npm", "run", "start:prod"]