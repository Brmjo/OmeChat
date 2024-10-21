const socket = io("/lobby");

let readyButton = document.getElementById("readyButton");
let isSearching = false;

readyButton.addEventListener('click', () => {
    if(isSearching) return;
    readyButton.textContent = "Searching for other user. Please wait...";
    isSearching = true;
    socket.emit('searchForPartner', { username });
});

socket.on('searchForPartnerSuccess', (data) => {
    isSearching = false;
    window.location.href = `/chat/${data.roomId}`;
});

socket.on('searchForPartnerFailed', (data) => {
    alert(data.message);
});