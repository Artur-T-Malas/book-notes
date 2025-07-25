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
    logoutForm.action = '/userLogout';
    logoutForm.method = 'get';
    loginPanel.appendChild(logoutForm);

    let logoutBtn = document.createElement('input');
    logoutBtn.type = 'submit';
    logoutBtn.value = 'Logout';
    logoutForm.appendChild(logoutBtn);

} else {
    // Hide user-specific book panel
    /*
    Hide user-specific book panel and
    show message that for rating books
    user must be logged in
    */
   let guestUserMsg = document.createElement('p');
   guestUserMsg.innerHTML = `
    To rate books please <a href="/login">login</a> or
    <a href="/register">register</a>.
   `;
   userBookPanel.replaceChildren(guestUserMsg);
}
