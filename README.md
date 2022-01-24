# Welcome to Boardgame Reviews

## Built by Neal Overton (https://github.com/nealoverton)

## Description

Boardgame Reviews is a Node.js/Express based API providing user-generated board game reviews to be voted and commented upon. All data is formatted in JSON and stored in a PostgreSQL database.

The live version can be accessed [here](https://boardgame-reviews.herokuapp.com/api)

## Requirements

### Prerequisistes

- Node.js 14.x
- PostgreSQL 12.x

## Cloning

In your terminal:

        $ git clone https://github.com/nealoverton/board-game-reviews.git
        $ cd board-game-reviews

## Running the Application

To initialise in node:

        $ npm install

You will need to create two ".env" files:

- ".env.development" should contain "PGDATABASE=<your_database_name>"
- ".env.test" should contain "PGDATABASE=<your_database_name>\_test"

Test and development data has been provided in the db/data folder. To seed your database with this data, run:

        $ npm run setup-dbs && npm run seed

## Testing and Development

Numerous test have been provided and separated by server endpoint. To run these tests use one of the following commands:

        $ npm run test-app
        $ npm run test-reviews
        $ npm run test-comments
        $ npm run test-users
        $ npm run test-categories

To open the dev environment

        $ npm start

## Using the Application

A complete list of endpoints and accepted queries can be found at GET /api
