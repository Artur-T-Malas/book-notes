let usernameInput = document.getElementById('username-input');
let passwordInput = document.getElementById('password-input');
let loginBtn = document.getElementById('login-btn');
let loginPanel = document.getElementById('login-panel')


const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^[a-zA-Z0-9\-\_\#\$\@]{6,30}$/;


function enableLoginBtn(event) {
    if (
        usernameInput.value.length >= 3
        && passwordInput.value.length >= 6
        && usernameRegex.test(usernameInput.value)
        && passwordRegex.test(passwordInput.value)
    ) {
        loginBtn.disabled = false;
    } else {
        loginBtn.disabled = true;
    }
}

usernameInput.addEventListener('input', enableLoginBtn);
passwordInput.addEventListener('input', enableLoginBtn)