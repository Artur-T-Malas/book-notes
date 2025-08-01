import express from "express";
import axios from "axios";
import pg from "pg";
import { config } from "./config.js"
import { DbService } from "./dbService.js";
import { AuthService } from "./authService.js";

const app = express();
const port = 3000;
const db = new pg.Client(config.dbConfig);
db.connect()
    .then(() => console.log(`Connected to DB ${config.dbConfig.database}`))
    .catch(err => console.log('DB Connection Error: ', err));
const dbService = new DbService(db);
const authService = new AuthService(dbService);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: Create or use middleware which sanitizes inputs

let books = [];
let highestRatedBooks = [];
let mostRatedBooks = [];
let userUnverifiedBooks = [];
let userRatedBooks = []; // TODO: Make the query etc.
let currentUser = 'None';
let currentUserId = 0;
let isLoggedIn = false;

app.get("/", async (req, res) => {
    highestRatedBooks = await dbService.getHighestRatedBooks();
    mostRatedBooks = await dbService.getMostRatedBooks();
    if (isLoggedIn && currentUserId != 0) {
        userUnverifiedBooks = await dbService.getUserUnverifiedBooks(currentUserId);
        userRatedBooks = await dbService.getUserRatedBooks(currentUserId);
    }
    res.render(
        'index.ejs',
        {
            isLoggedIn: isLoggedIn,
            username: currentUser,
            highestRatedBooks: highestRatedBooks,
            mostRatedBooks: mostRatedBooks,
            userUnverifiedBooks: userUnverifiedBooks,
            userRatedBooks: userRatedBooks
        }
    );
});

app.get("/login", (req, res) => {
    res.render('login.ejs');
});

app.get("/register", (req, res) => {
    res.render('register.ejs');
});

app.post("/logout", (req, res) => {
    isLoggedIn = false;
    currentUser = '';
    res.redirect('/');
});

app.post("/login", async (req, res) => {
    // TODO: Validate and sanitize input
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    currentUserId = await authService.loginUser(username, password);
    if (!currentUserId) {
        res.redirect('/');
        return;
    }
    currentUser = username;
    isLoggedIn = true;
    console.log(currentUserId);
    res.redirect('/');
});

app.post("/register", async (req, res) => {
    // TODO: Validate and sanitize input
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    currentUserId = await authService.registerUser(username, email, password);
    if (!currentUserId) {
        res.status(500).json({ error: 'Registration failed' });
        return;
    }
    isLoggedIn = true;
    currentUser = username;
    res.redirect('/')
});

app.get("/rateBook", (req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    res.render(
        'rateBook.ejs',
        { books: books }
    );
});

app.post("/ratings", async (req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    // TODO: Sanitize input
    console.log(req.body);
    const title = req.body.title;
    const rating = parseInt(req.body.rating);
    if (rating > 10 || rating < 1) {
        res.status(400).json({ error: 'Invalid input. Rating must be an integer between 1 and 10 (inclusive).' });
        return;
    }
    const notes = req.body.notes;
    await dbService.addRatingAndNotes(currentUserId, title, rating, notes);
    res.redirect('/');
});

app.get("/newBook", (req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    res.render('newBook.ejs');
});


// API
app.get("/books", async (req, res) => {
    console.log('req.query: ', req.query, typeof req.query);
    if (Object.keys(req.query).length < 1) {
        res.status(403).json({ 'message': 'Retrieving all books is not allowed at this point' });
        return;
    }
    // TODO: Add validation and sanitization
    let foundBooks = [];
    if (req.query.title) { // Expects query param: ?title=<title>
        const titleToSearch = req.query.title; // TODO: Add a condition which checks whether query params are present
        if (titleToSearch.length < 3) {
            res.status(400).json({'message': 'Title too short to search by. Mininum 3 characters are required.'});
            return;
        }
        foundBooks = await dbService.findBooksForUserRating(currentUserId, titleToSearch);
    } else if (
        req.query.verified == 'false' || req.query.username // Expects query params: ?verified=false&username=<username>
    ) {
        // Check if user exists
        const username = req.query.username;
        const foundUser = await dbService.getUserByUsername(username);
        const doesUserExist = Boolean(foundUser);
        if (!doesUserExist) {
            res.status(404).json({ 'message': `User ${username} does not exist.` });
            return;
        }

        // Check if current user is allowed to get unverified books for the provided user
        if (username != currentUser) { // TODO: Also check if the user is NOT an admin
            res.status(403).json({ 'message': 'You can only get unverified books created by yourself' });
            return;
        }

        foundBooks = await dbService.getUserUnverifiedBooks(foundUser.id);

    }
    res.status(200).json(foundBooks);
});

app.post("/books", async (req, res) => {
    // TODO: Validate and sanitize input
    const title = req.body.title;
    const author = req.body.author;
    await dbService.createBook(title, author, currentUserId);
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});