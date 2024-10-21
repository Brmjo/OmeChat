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

const lobbyNamespace = io.of("/lobby");

let waitingQueue = [];

lobbyNamespace.on('connection', (socket) => {
    console.log("Someone connected to lobby server.");
    
    let username = null;
    let joinedRoomId = null;
    
    socket.on("searchForPartner",  (data) => {
        username = data.username;
        
        const findPartnerPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("There are currently no other users available. Try again in a few minutes."));
            }, 30000);
            
            socket.findPartnerFunctions = { resolve, reject, timeout };
            
            waitingQueue.push(socket);
            
            findMatch();
        });
        
        findPartnerPromise.then((roomId) => {
            joinedRoomId = roomId;
            socket.emit('searchForPartnerSuccess', { roomId });
        }).catch((message) => {
            socket.emit('searchForPartnerFailed', { message });
        });
    });
    
    socket.on('disconnect', () => {
        const socketIndex = waitingQueue.indexOf(socket);
        
        if(socketIndex !== -1) {
            waitingQueue.splice(socketIndex, 1);
            if(socket.findPartnerFunctions) {
                clearTimeout(socket.findPartnerFunctions.timeout)
                socket.findPartnerFunctions.reject("User disconnected while waiting.");
                socket.findPartnerFunctions = null;
            }
        }
    })
});

function removeUserFromQueue(socketToRemove) {
    const indexOfSocket = waitingQueue.indexOf(socketToRemove);
    if(indexOfSocket !== -1) {
        waitingQueue.splice(indexOfSocket, 1);
    }
}

function findMatch() {
    if(waitingQueue.length < 2) {
        return;
    }
    
    const user1 = waitingQueue.shift();
    const user2 = waitingQueue.shift();
    
    clearTimeout(user1.findPartnerFunctions.timeout);
    clearTimeout(user2.findPartnerFunctions.timeout);
    
    const roomId = `${user1.id}+${user2.id}`;
    
    user1.findPartnerFunctions.resolve(roomId);
    user2.findPartnerFunctions.resolve(roomId);
    
    socketJoinRoom(user1, roomId);
    socketJoinRoom(user2, roomId);
}

function socketJoinRoom(socket, roomId) {
    if(socket && roomId) {
        socket.join(roomId);
        removeUserFromQueue(socket);
        socket.emit('matchFound', { roomId });
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

const port = process.env.PORT || 3000;
httpServer.listen(3000, () => {
    console.log("Server is up!");
});