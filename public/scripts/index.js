let isLoggedIn = window.backendData.isLoggedIn;
let currentUser = window.backendData.username;
let loginPanel = document.getElementById('login-panel');
let loggedInPanel = document.getElementById('logged-in-panel');
let loginForm = document.getElementById('login');
let loginBtn = document.getElementById('login-btn');
let registerForm = document.getElementById('register');
let registerBtn = document.getElementById('register-btn');
let userBookPanel = document.getElementById('user-book-panel');
let guestUserMsg = document.getElementById('guest-user-msg');

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
    guestUserMsg.remove(); // Get rid of the "To rate books..." message

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

    let yourRatedBooksH2 = document.createElement('h2');
    yourRatedBooksH2.innerText = 'Your Rated Books';
    userBookPanel.appendChild(yourRatedBooksH2);

    let userBookBtnPanel = document.createElement('div');
    userBookBtnPanel.classList.add('button-panel');
    userBookPanel.appendChild(userBookBtnPanel);

    let rateBookForm = document.createElement('form');
    rateBookForm.action = '/rateBook';
    rateBookForm.method = 'get';
    userBookBtnPanel.appendChild(rateBookForm);

    let rateBookBtn = document.createElement('button');
    rateBookBtn.type = 'submit';
    rateBookBtn.classList.add('button-primary');
    rateBookBtn.innerText = 'Rate Book';
    rateBookForm.appendChild(rateBookBtn);

    let newBookForm = document.createElement('form');
    newBookForm.action = '/newBook';
    newBookForm.method = 'get';
    userBookBtnPanel.appendChild(newBookForm);

    let newBookBtn = document.createElement('button');
    newBookBtn.type = 'submit';
    newBookBtn.classList.add('button-secondary');
    newBookBtn.innerText = 'New Book';
    newBookForm.appendChild(newBookBtn);
}
