import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import models, { connectDb } from './models';
import { Server, Socket } from "socket.io";
import { InMemoryRoomStore } from "./breakout/roomStore";
import { InMemorySessionStore } from "./sessionStore";
import { createRooms, sendToBreakout } from './breakout/breakout';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(async (req, res, next) => {
    req.context = {
        models,
    };
    next();
});

app.use('/poll', routes.poll);

var server;

connectDb().then(async () => {

});



server = app.listen(process.env.API_PORT, () =>
    console.log(`Listening on port ${process.env.API_PORT}`),
);


//socketio stuff
const roomStore = new InMemoryRoomStore();
const sessionStore = new InMemorySessionStore();
const io = new Server(server, {
    cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    },
    path: process.env.SOCKET_IO_PATH
});


const randomId = () => { return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) };
//this is for authenticating users

io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {

        // find existing session
        const session = sessionStore.findSession(sessionID);
        if (session) {

            socket.sessionID = sessionID;
            socket.userID = session.userID;
        }
        else {
            socket.sessionID = sessionID;
            socket.userID = randomId();
        }

        return next();

    }

    // create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    next();
});


io.on('connection', socket => {

    //Remove this later, it's for debugging
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });

    console.log('socket ' + socket.id + ' connected ');

    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        connected: true,
    });
    roomStore.newUser(socket.userID);

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });

    socket.join(socket.userID);


    socket.on("disconnect", () => {

        const matchingSockets = io.of('/').adapter.rooms.get(socket.userID);
        const isDisconnected = matchingSockets === undefined;
        if (isDisconnected) {
            // notify other users
            console.log("user disconnected", socket.userID);

            // leave the rooms
            const rooms = roomStore.getRoomsForUser(socket.userID);
            for (let roomName of rooms) {
                roomStore.leaveRoom(roomName, socket.userID);
            }

            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                connected: false,
            });
        }
    });

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        let room = roomStore.joinRoom(roomName, socket.userID);
        //join all the parents (useful if user disconnects page while on breakout room)
        while (room.parent) {
            socket.join(room.parent);
            room = roomStore.joinRoom(room.parent, socket.userID);
        }

        console.log(roomStore.rooms.get(roomName).connectedUsers);

    });

    socket.on('jitsiUser', (jitsiUserName) => {
        socket.jitsiUserName = jitsiUserName;
    });

    socket.on('getRoomData', (roomName) => {
        let room = roomStore.getRoom(roomName);
        if (!room) {
            room = roomStore.newRoom(roomName, socket.userID);
        }
        socket.emit('roomData', room);
    });



    socket.on('sendToBreakout', (roomName, size, breakoutOption, smartBreakoutOption) => {

        const users = Array.from(roomStore.getUsers(roomName)).filter(x => { return x !== socket.userID; });;
        const pollId = roomStore.getPoll(roomName);

        if (pollId) {
            let answers = {};
            models.Poll.findById(pollId).then(
                (poll) => {
                    const distribution = createRooms(size, users, breakoutOption, smartBreakoutOption, poll);
                    sendToBreakout(socket, roomName, distribution, roomStore, pollId);
                }
            );

        }
        else {
            //this is a quick fix to make it not throw an error when there's no poll in the room
            let emptyPoll = {
                votes: new Map(),
                alternatives: []
            }
            const distribution = createRooms(size, users, breakoutOption, 'random', emptyPoll);
            sendToBreakout(socket, roomName, distribution, roomStore, pollId);
        }
    });

    socket.on('callToMainRoom', (mainRoomName) => {
        console.log('calling all people back to room ', mainRoomName);
        socket.to(mainRoomName).emit('returnToMainRoom', mainRoomName);
    });

    socket.on('forceToMainRoom', (mainRoomName) => {
        console.log('forcing all people back to room ', mainRoomName);
        socket.to(mainRoomName).emit('forceToMainRoom', mainRoomName);
    });


    socket.on('setPollId', (roomName, pollId) => {
        console.log('sending poll ' + pollId + " to users on room " + roomName);
        roomStore.setPoll(roomName, pollId);
        io.to(roomName).emit("pollChanged", roomName, pollId);
    });

    socket.on('showResults', (roomName) => {
        socket.to(roomName).emit('showResults', roomName);
    });

    socket.on('leaveRoom', (roomName) => {
        if (roomName) {
            if (roomStore.getRoom(roomName)) {
                roomStore.leaveRoom(roomName, socket.userID);
            }
        }
    });

});