FROM node:16

# Create app directory
WORKDIR /usr/src/app

#copy package.json and package-lock.json
COPY package*.json ./

#install dependencies
RUN npm install

#copy source
COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]