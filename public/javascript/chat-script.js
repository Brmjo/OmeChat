const socket = io();

const messageForm = document.getElementById("messageForm");
const chatBox = document.getElementById("chatbox");

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const message = document.getElementById("messageInput").value;
    if(!message) return alert("Invalid message!");
    socket.emit('sendMessage', {roomId, message});
})

socket.emit('joinRoom', ({ roomId }));

socket.on('recieveMessage', (data) => {
    displayMessage(data);
})

function displayMessage(message) {
    const messageBox = document.createElement('div');
    const name = document.createElement('span');
    const chat = document.createElement('span');
    
    name.textContent = "Stranger: ";
    chat.textContent = message;
    
    messageBox.appendChild(name);
    messageBox.appendChild(chat);
    
    chatBox.appendChild(messageBox);
}