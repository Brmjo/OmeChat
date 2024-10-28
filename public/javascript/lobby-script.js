const socket = io("/lobby");

let readyButton = document.getElementById("readyButton");
let isSearching = false;

readyButton.addEventListener('click', () => {
    if(isSearching) return;
    readyButton.textContent = "Searching for other user. Please wait...";
    isSearching = true;
    toggleLoadingAnimation();
    socket.emit('searchForPartner', { username });
});

socket.on('searchForPartnerSuccess', (data) => {
    isSearching = false;
    toggleLoadingAnimation();
    changeButtonText("START CHATTING!");
    window.location.href = `/chat/${data.roomId}`;
});

socket.on('searchForPartnerFailed', (data) => {
    isSearching = false;
    toggleLoadingAnimation();
    changeButtonText("START CHATTING!");
    alert(data.message);
});

function toggleLoadingAnimation() {
    if(isSearching) {
        document.getElementById("loadingAnimation").style.display = "block";
    }else {
        document.getElementById("loadingAnimation").style.display = "none";
    }
}

function changeButtonText(text) {
    readyButton.textContent = text;
}