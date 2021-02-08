import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import models, { connectDb } from './models';
import { Server, Socket } from "socket.io";


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
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
});

var counter = 0;
io.on('connection', socket => {
    counter += 1;
    console.log('user ' +  socket.id + ' connected ' + counter);
    socket.on('disconnect', () => {
        console.log('user diconnected')
        counter -= 1;
    });

    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log('joined room' + roomName);
        console.log(socket.rooms);
    });

    socket.on("setUserName", (username) => {
        socket.username = username;
        console.log('user name set to ' + username);
    });    

    socket.on('sendToBreakout', (roomName) => {
        socket.to(roomName).emit('notifyBreakout', 'new' + roomName);
    });

});
