const express = require('express');
const path = require('path');
const app = express();
const { Server } = require('socket.io');
const http = require('http');

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let readyUsers = [];

io.on('connection', (socket) => {
    console.log('A user has been connected.');
    
    socket.on('ready', (data) => {
        const { username } = data;
        readyUsers.push({ socketId: socket.id, username: username });
        console.log(readyUsers);
        if(findMatch() == 0) {
            console.log("Waiting for more users");
        }
    });
    
    socket.on('joinRoom', (data) => {
        socket.join(data.roomId);
    });
    
    socket.on('sendMessage', (data) => {
        socket.to(data.roomId).emit('recieveMessage', data.message);
    })
    
    socket.on('disconnect', () => {
        console.log("A user has been disconnected.");
        removeUserFromQueue(socket.id);
    });
});

function removeUserFromQueue(socketIdToRemove) {
    readyUsers.filter(socketId => socketId !== socketIdToRemove);
    console.log(readyUsers);
}

function findMatch() {
    if(readyUsers.length < 2) return 0;
    const user1 = readyUsers.shift();
    const user2 = readyUsers.shift();
    
    const roomId = `${user1.socketId}+${user2.socketId}`;
    io.to(user1.socketId).emit('matchFound', { roomId, partner: user2.username});
    io.to(user2.socketId).emit('matchFound', { roomId, partner: user1.username});
    
    socketJoinRoom(user1.socketId, roomId);
    socketJoinRoom(user2.socketId, roomId);
    return 1;
}

function socketJoinRoom(socketId, roomId) {
    const socket = io.sockets.sockets.get(socketId);
    if(socket) {
        socket.join(roomId);
        removeUserFromQueue(socketId);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/chat/:roomid', (req, res) => {
    res.render('chat', { roomid: req.params.roomid });
});

app.get('/lobby/:username', (req, res) => {
    let username = req.params.username;
    const data = { username: username };
    res.render('lobby', data);
});

httpServer.listen(3000, () => {
    console.log("Server is up!");
});