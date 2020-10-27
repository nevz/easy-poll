# Easy Poll

Easy poll is an app that lets you make polls, easily. It has a web client, made with React, and an api, which was made using Express + MongoDB.

## Installation and configuration instructions
To setup the client you hace to create copies of the `example.env` files in the main folder and both the client and api folders, and name them `.env`. After doing that, you have to setup the constants there to match whatever configuration you have. Most of the constants are just ports and urls. (Sorry for not putting everything in just one file, but I didn't know how to do it and don't have time for that right now).

Since the app is dockerized, all you have to do after configuration is install Docker and docker-compose, and then run `docker-compose up` on your terminal.

## Restarting the server
If you need to restart the process, just shut down the docker process, and then run `docker-compose up` again.
