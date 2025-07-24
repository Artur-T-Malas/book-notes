let isLoggedIn = window.backendData.isLoggedIn;
let authButtonsDiv = document.getElementById('auth-buttons');
let loggedInPanel = document.getElementById('logged-in-panel');

if (!isLoggedIn) {
    loggedInPanel.classList.add('hidden');
} else {
    authButtonsDiv.classList.add('hidden');
    let inputs = authButtonsDiv.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }
}
