import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import models, { connectDb } from './models';
import { Server, Socket } from "socket.io";
import { InMemoryRoomStore } from "./breakout/roomStore";
import {InMemorySessionStore} from "./sessionStore";
import {createRoomsByQuantity, createRoomsBySize} from './breakout/breakout';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
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



server = app.listen(process.env.API_PORT, ()=> 
console.log(`Listening on port ${process.env.API_PORT}`), 
);


//socketio stuff
const roomStore = new InMemoryRoomStore();
const sessionStore = new InMemorySessionStore();
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
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
        else{
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
      
    console.log('user ' +  socket.id + ' connected ');

    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    });
    roomStore.newUser(socket.userID);

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
    });
    
    socket.join(socket.userID);


    socket.on("disconnect", async () => {

        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            console.log("user disconnected", socket.userID);
            
            // leave the rooms
            const rooms = roomStore.getRoomsForUser(socket.userID);
            for(let roomName of rooms){
                roomStore.leaveRoom(roomName, socket.userID);
            }

            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: socket.username,
            connected: false,
            });
       
          
        }
      });

    

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        let room = roomStore.joinRoom(roomName, socket.userID);
        //join all the parents
        while(room.parent){
            socket.join(room.parent);
            room = roomStore.joinRoom(room.parent, socket.userID);
        }

        console.log(roomStore.rooms.get(roomName).connectedUsers);

    });

    socket.on('getRoomData', (roomName) => {
        let room = roomStore.getRoom(roomName);
        if(!room){
            room = roomStore.newRoom(roomName, socket.userID);
        }
        console.log(room);
        socket.emit('roomData', room);
    });



    socket.on('sendToBreakout', (roomName, size) => {

    /* io.socket.clients().forEach((socket) => {
            console.log(socket);
        });
        console.log(io.socket.clients());
    */

    //con esto se itera por todos los sockets en roomName
        const pollId = roomStore.getPoll(roomName);

        let users = Array.from(roomStore.getUsers(roomName)).filter( x => { return x!==socket.userID; });;
        console.log(users)        

        const distribution = createRoomsByQuantity(size, users);

        /*
        models.Poll.findById(pollId).then(
            (poll) => {
                console.log(poll.question);
                console.log('sending to new room ' + roomName );
                socket.to(roomName).emit('notifyBreakout', 'aaaaaaaaaaaaaaaaaa');
            }
        );
        */
        let roomCounter = 0;
        const breakoutRoomNames = []
        for(let group of distribution){
            roomCounter++;
            const breakoutRoomName = roomName + 'easyFlipRoom' + roomCounter;
            breakoutRoomNames.push(breakoutRoomName);
            const newRoom = roomStore.newRoom(breakoutRoomName, undefined, roomName);
            for(let userID of group){
                socket.to(userID).emit('notifyBreakout', {breakoutRoomName: breakoutRoomName, originalRoomName: roomName});
                console.log('sending user ' + userID + ' to breakout room ' + breakoutRoomName);
            }
        }
        socket.emit('roomsCreated', breakoutRoomNames);

    });
    
    socket.on('callToMainRoom', (mainRoomName) => {
        console.log('calling all people back to room ', mainRoomName);
        socket.to(mainRoomName).emit('returnToMainRoom', mainRoomName);
    });

    socket.on('setPollId', (roomName, pollId) => {
        console.log('sending poll ' + pollId + " to users on room " + roomName );
        roomStore.setPoll(roomName, pollId);
        socket.to(roomName).emit("pollChanged", roomName, pollId);
    });

    socket.on('leaveRoom', (roomName) => {
        if(roomName){
            if(roomStore.getRoom(roomName)){
                roomStore.leaveRoom(roomName, socket.userID)
            }
            
        }
    });




});
