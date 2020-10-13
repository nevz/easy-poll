# Easy Poll

Easy poll is an app that lets you make polls, easily. It has a web client, made with React, and an api, which was made using Express + MongoDB.

## Installation instructions
Since the app is dockerized, all you have to do is install Docker and docker-compose, and then run `docker-compose up` on your terminal.
You can change the api port and the mongodb url in the .env file in the api folder (default port for the api is 9000).
If you do change that, you also have to modify the constants.js file in the client to match the api url (which you will have to do anyway, since you won't be running the app in the same machine as i).