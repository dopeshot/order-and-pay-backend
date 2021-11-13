## Overview
This is the backend for the order and pay app.
## Content
The only file a dev needs is the .env file. This can be found on discord in the corresponding channel.
To test and understand the provided endpoints .REST files are included in the project. These can be used to send requests to the localhost using Rest Client extension for VSC (humao.rest-client).
## Usage
To start the project use 

    npm run start
or for development:

    npm run start:dev

to run end to end tests locally:

    npm run test:e2e

The current pipeline runs end2end test (in a very basic scope) and builds the software.

For the Docker env setup run:
    
    docker-compose -f docker-compose.dev.yaml up
