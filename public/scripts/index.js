let isLoggedIn = window.backendData.isLoggedIn;
let currentUser = window.backendData.username;
let loginPanel = document.getElementById('login-panel');
let loggedInPanel = document.getElementById('logged-in-panel');
let loginForm = document.getElementById('login');
let loginBtn = document.getElementById('login-btn');
let registerForm = document.getElementById('register');
let registerBtn = document.getElementById('register-btn');
let userBookPanel = document.getElementById('user-book-panel');

// if (!isLoggedIn) {
//     loggedInPanel.classList.add('hidden');
// } else {
//     loginPanel.classList.add('hidden');
//     let inputs = loginPanel.querySelectorAll('input');
//     for (let i = 0; i < inputs.length; i++) {
//         inputs[i].disabled = true;
//     }
// }
console.log('isLoggedIn: ', isLoggedIn);
if (isLoggedIn) {
    registerForm.remove();
    loginForm.remove();

    let welcomeMsg = document.createElement('p');
    welcomeMsg.innerText = `Welcome, ${currentUser}`;
    loginPanel.appendChild(welcomeMsg);

    let logoutForm = document.createElement('form');
    logoutForm.action = '/logout';
    logoutForm.method = 'post';
    loginPanel.appendChild(logoutForm);

    let logoutBtn = document.createElement('input');
    logoutBtn.type = 'submit';
    logoutBtn.value = 'Logout';
    logoutForm.appendChild(logoutBtn);

} else {
    // Hide user-specific book panel
    userBookPanel.remove();
}