const socket = io();

let readyButton = document.getElementById("readyButton");
let isSearching = false;

readyButton.addEventListener('click', () => {
    if(isSearching) return;
    readyButton.textContent = "Searching for other user. Please wait...";
    isSearching = true;
    socket.emit('ready', { username });
});

socket.on('matchFound', (data) => {
    isSearching = false;
    window.location.href = `/chat/${data.roomId}`;
})