const usernameInput = document.getElementById("username-input-box");

usernameInput.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const username = document.getElementById("username-input").value;
    if(!username) return;
    
    login(username);
});

function login(username) {
    window.location.href = `/lobby/${username}`;
}