const socket = io();

const messageForm = document.getElementById("messageForm");
const chatBox = document.getElementById("chatbox");

window.onload = () => {
    displaySystemMessage("You are now chatting with a stranger.");
}

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const message = document.getElementById("messageInput");
    if(!message.value) return alert("Invalid message!");
    socket.emit('sendMessage', {roomId, message: message.value});
    displayMessage(message.value, false);
    message.value = "";
})

socket.emit('joinRoom', ({ roomId }));

socket.on('recieveMessage', (data) => {
    displayMessage(data, true);
});

socket.on("strangerDisconnected", (data) => {
    alert(data);
});

function displayMessage(message, isStranger) {
    const messageBox = document.createElement('div');
    const name = document.createElement('div');
    const chat = document.createElement('div');
    
    messageBox.classList.add("message-box");
    name.classList.add("message-box-name");
    chat.classList.add("message-box-chat");
    
    if(isStranger) {
        name.textContent = "Stranger";
        messageBox.classList.add("stranger-message-box")
    }else {
        name.textContent = "You";
        messageBox.classList.add("your-message-box");
    }
    chat.textContent = message;
    
    messageBox.prepend(chat);
    messageBox.prepend(name);
    
    chatBox.prepend(messageBox);
}

function displaySystemMessage(message) {
    const messageBox = document.createElement("div");
    const systemMessage = document.createElement("p");
    
    messageBox.classList.add("message-box");
    systemMessage.classList.add("message-box-system-message");
    
    systemMessage.textContent = message;
    
    messageBox.prepend(systemMessage);
    chatBox.prepend(messageBox);
}