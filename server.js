const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const botName = 'ChitChat Bot';
const botGender = "bot";

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Socket code starts
//runs when user connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room, gender}) => {
        const user = userJoin(socket.id, username, room, gender);

        socket.join(user.room);

         //this will emmit message only one user
        socket.emit('message', formatMessage(botName, botGender, "Welcome to ChitChat"));

        //Broadcast message
        //this will send message to all users excluding the user conecting
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, botGender, `${user.username} has joined chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for cht message from user
    socket.on('newMessage', msg => {
        const user = getCurrentUser(socket.id);

        //emmits to everyone
        io.to(user.room).emit('message', formatMessage(user.username, user.gender, msg));
    });

    //typing option
    socket.on('typing', (data)=>{
        const user = getCurrentUser(socket.id);

        if(data.typing==true){
            socket.broadcast.to(user.room).emit('display', {data, user});
        }
        else if (data.typing == false){
            const users = getRoomUsers(user.room);
            socket.broadcast.to(user.room).emit('display', {data, user:users});
        }
    })

    //runs when user disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id); 

        //emits to everyone including user sending message
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, botGender, `${user.username} has left the chat`));

            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
})

server.listen(PORT, () => {
    console.log(`Chat Server is running on port ${PORT}`);
})