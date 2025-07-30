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
let currentUser = 'None';
let currentUserId = 0;
let isLoggedIn = false;

app.get("/", async (req, res) => {
    highestRatedBooks = await dbService.getHighestRatedBooks();
    mostRatedBooks = await dbService.getMostRatedBooks();
    res.render(
        'index.ejs',
        {
            isLoggedIn: isLoggedIn,
            username: currentUser,
            highestRatedBooks: highestRatedBooks,
            mostRatedBooks: mostRatedBooks
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

app.get("/books", async (req, res) => {
    console.log('req.query: ', req.query);
    // TODO: Add validation and sanitization
    const titleToSearch = req.query.title; // TODO: Add a condition which checks whether query params are present
    if (titleToSearch.length < 3) {
        res.status(400).json({'message': 'Title too short to search by. Mininum 3 characters are required.'});
        return;
    }
    const foundBooks = await dbService.findBooksForUserRating(currentUserId, titleToSearch);
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