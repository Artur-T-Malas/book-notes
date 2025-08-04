let usernameInput = document.getElementById('username-input');
let emailInput = document.getElementById('email-input')
let passwordInput = document.getElementById('password-input');
let registerBtn = document.getElementById('register-btn');
let registerPanel = document.getElementById('register-panel')


const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const passwordRegex = /^[a-zA-Z0-9\-\_\#\$\@]{6,30}$/;


function enableRegisterBtn(event) {
    if (
        usernameInput.value.length >= 3
        && passwordInput.value.length >= 6
        && emailInput.value.length <= 100
        && usernameRegex.test(usernameInput.value)
        && passwordRegex.test(passwordInput.value)
    ) {
        registerBtn.disabled = false;
    } else {
        registerBtn.disabled = true;
    }
}

usernameInput.addEventListener('input', enableRegisterBtn);
emailInput.addEventListener('input', enableRegisterBtn);
passwordInput.addEventListener('input', enableRegisterBtn)