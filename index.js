import express from "express";
import axios from "axios";
import pg from "pg";
import { config } from "./config.js"
import { DbService } from "./dbService.js";
import { AuthService } from "./authService.js";
import { body, validationResult } from "express-validator";

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

app.post("/login",
    [
        body('username').trim().isLength( { min: 3, max: 20 }).isAlphanumeric().escape(),
        body('password').trim().isLength( { min: 6, max: 30 } ).blacklist(`=<>\/\\'";`)
    ],
async (req, res) => {
    console.log('req.body: ', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Login validation errors: ', errors);
        return res.status(400).json({ message: "Forbidden characters found in user input" });
    }
    const username = req.body.username;
    const password = req.body.password;
    const userResult = await authService.loginUser(username, password);
    console.log('userResult: ', userResult);
    if (!userResult.success) {
        res.render(
            'login.ejs',
            {
                username: username,
                isLoginFailed: true,
                isWrongUsername: userResult.isWrongUsername,
                isWrongPassword: userResult.isWrongPassword
            }
        )
        return;
    }
    currentUser = userResult.user.username;
    currentUserId = userResult.user.id;
    isLoggedIn = true;
    console.log(currentUserId);
    res.redirect('/');
});

app.post("/register", async (req, res) => {
    // TODO: Validate and sanitize input
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

app.get("/editRating/:id", async (req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    const ratingId = req.params.id;
    const book = await dbService.getBookByRatingId(ratingId);
    const ratingResult = await dbService.getUserBookNotes(ratingId);
    if (!ratingResult.success) {
        res.status(ratingResult.statusCode).send(`Rating with ID ${ratingId} not found`);
        return;
    }
    const rating = ratingResult.rating;
    res.render(
        'rateBook.ejs',
        {
            isEdit: true,
            ratingId: ratingId,
            bookTitle: book.title,
            rating: rating
        }
    );
});

app.get("/deleteRating/:id", async (req, res) => {
    const ratingId = req.params.id;
    const book = await dbService.getBookByRatingId(ratingId);
    res.render(
        'deleteRatingConfirmation.ejs',
        {
            bookTitle : book.title,
            ratingId: ratingId
        }
    );
});

app.post("/deleteRating/:id", async (req, res) => {
    const ratingId = req.params.id;

    // Check if user has access to deleting this rating
    const userResult = await dbService.getUserFromRatingAndNotes(ratingId);
    if (!userResult.success) {
        if (userResult.statusCode === 500) {
            res.status(500).json({ message: "Server side error" });
            return;
        }
        res.status(userResult.statusCode).json({ message: `Rating ID ${ratingId} not found` });
        return;
    }
    if (userResult.user.id != currentUserId) {
        console.warn(`User ${currentUserId} tried deleting rating ID ${ratingId} to which they don't have access.`);
        res.status(403).json({ message: 'Forbidden' });
        return;
    }

    console.log(`Deleting rating ${ratingId}`);
    const result = await dbService.deleteRatingAndNotes(ratingId);
    if (!result.success) {
        if (result.wrongDeletion) {
            res.status(500).json({ message: "Server side error" });
            return;
        }
        res.status(404).json({ message: `Rating ID ${ratingId} not found` });
        return;
    }
    res.redirect('/');
});

app.post("/ratings", async (req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    // TODO: Sanitize input
    if (req.body.isEdit) {
        const ratingId = req.body.ratingId;
        const rating = req.body.rating;
        const notes = req.body.notes;

        // Check if user has access to deleting this rating
        const userResult = await dbService.getUserFromRatingAndNotes(ratingId);
        if (!userResult.success) {
            if (userResult.statusCode === 500) {
                res.status(500).json({ message: "Server side error" });
                return;
            }
            res.status(userResult.statusCode).json({ message: `Rating ID ${ratingId} not found` });
            return;
        }
        if (userResult.user.id != currentUserId) {
            console.warn(
                `User ${currentUserId} tried editing rating ID ${ratingId} to which they don't have access.
                It belong to user ${userResult.user.id}`
            );
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        const editResult = await dbService.updateUserBookNotes(ratingId, rating, notes);
        if (!editResult.success) {
            res.sendStatus(editResult.statusCode);
            return;
        }

        res.redirect('/');
        return;
    }
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