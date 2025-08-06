import express from "express";
import axios from "axios";
import pg from "pg";
import { config } from "./config.js"
import { DbService } from "./dbService.js";
import { AuthService } from "./authService.js";
import { body, param, query, validationResult, matchedData } from "express-validator";

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
        body('username').trim().isLength( { min: 3, max: 20 }).isAlphanumeric(),
        body('password').trim().isLength( { min: 6, max: 30 } ).escape()
    ],
async (req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Login validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const username = sanitized.username;
    const password = sanitized.password;

    const userResult = await authService.loginUser(username, password);
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
    currentUser = userResult.username;
    currentUserId = userResult.userId;
    isLoggedIn = true;
    res.redirect('/');
});

app.post("/register",
    [
        body('username').trim().isLength({ min: 3, max: 20 }).isAlphanumeric().escape(),
        body('email').trim().isLength({ max: 100 }).isEmail().blacklist(`=<>\/\\'";`),
        body('password').trim().isLength({ min: 6, max: 30 }).blacklist(`=<>\/\\'";`)
    ],
async (req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Register validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const username = sanitized.username;
    const email = sanitized.email;
    const password = sanitized.password;

    const registerResult = await authService.registerUser(username, email, password);
    if (!registerResult.success) {

        if (
            registerResult.alreadyExists
            || registerResult.isEmailAlreadyUsed
        ) {
            res.status(registerResult.statusCode).render(
                'register.ejs',
                {
                    isRegisterFailed: true,
                    alreadyExists: registerResult.alreadyExists ? registerResult.alreadyExists : false,
                    isEmailAlreadyUsed: registerResult.isEmailAlreadyUsed ? registerResult.isEmailAlreadyUsed : false,
                    username: username,
                    email: email
                }
            );
            return
        }
        res.status(500).json({ error: 'Registration failed' });
        return;
    }
    currentUserId = registerResult.userId;
    isLoggedIn = true;
    currentUser = username;
    res.redirect('/')
});

app.get("/rateBook", 
[
    query('bookId').trim().optional().isNumeric(),
    query('bookTitle').trim().isLength({ max: 100 }).escape().blacklist(`=<>\/\\'";`),
],
(req, res) => {
    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('RatingId validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

     // Sanitization
    const sanitized = matchedData(req);
    const bookId = sanitized.bookId;
    const bookTitle = sanitized.bookTitle;

    res.render(
        'rateBook.ejs',
        {
            // books: books,
            bookId: bookId ? bookId : null,
            bookTitle: bookTitle ? bookTitle : null
        }
    );
});

app.get("/editRating/:id",
[
    param('id').trim().exists().isNumeric()
],
async (req, res) => {

    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('RatingId validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const ratingId = sanitized.id;

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
            bookId: book.id,
            rating: rating
        }
    );
});

app.get("/deleteRating/:id", 
[
    param('id').trim().exists().isNumeric()
],    
async (req, res) => {
    
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('RatingId validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const ratingId = sanitized.id;
    const book = await dbService.getBookByRatingId(ratingId);
    res.render(
        'deleteRatingConfirmation.ejs',
        {
            bookTitle : book.title,
            ratingId: ratingId
        }
    );
});

app.post("/deleteRating/:id",
[
    param('id').trim().exists().isNumeric()
],
async (req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('RatingId validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const ratingId = sanitized.id;

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

    console.log(`Deleting rating "${ratingId}" by "${currentUser}"`);
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

app.post("/ratings",
[
    body('ratingId').optional().trim().isNumeric(),
    body('bookId').trim().isNumeric(),
    body('isEdit').optional().trim().isBoolean(),
    body('title').trim().isLength({ max: 100 }).escape().blacklist(`=<>\/\\'";`),
    body('rating').trim().isNumeric(),
    body('notes').trim().isLength({ max: 500 }).escape().blacklist(`=<>\/\\'";`)
],
async (req, res) => {

    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Ratings and notes validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const bookTitle = sanitized.title;
    const bookId = parseInt(sanitized.bookId);
    const rating = parseInt(sanitized.rating);
    const notes = sanitized.notes;

    if (sanitized.isEdit) {
        const ratingId = sanitized.ratingId;

        // Check if user has access to editing this rating
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

    // Check if the rating doesn't exist yet
    const existingRatingAndNotes = await dbService.getUserBookNotesByUserAndBookId(currentUserId, bookId);
    if (existingRatingAndNotes) {
        res.status(409).json({ message: `Rating of "${bookTitle}" by user Id "${currentUserId}" already exists.` });
        return;
    }
    if (rating > 10 || rating < 1) {
        res.status(400).json({ message: 'Invalid input. Rating must be an integer between 1 and 10 (inclusive).' });
        return;
    }
    await dbService.addRatingAndNotes(currentUserId, bookId, rating, notes);
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
app.get("/api/books",
[
    query('title').optional().trim().isLength({ min: 3, max: 100 }).escape().blacklist(`=<>\/\\'";`),
    query('verified').optional().trim().isBoolean(),
    query('username').optional().trim().isLength({ min: 3, max: 20 }).isAlphanumeric()
],
async (req, res) => {
    console.log('req.query: ', req.query, typeof req.query);

    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Books query validation errors: ', errors);
        return res.status(400).json({ message: "Validation of query failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);

    if (Object.keys(req.query).length < 1) {
        res.status(403).json({ 'message': 'Retrieving all books is not allowed at this point' });
        return;
    }
    let foundBooks = [];
    if (sanitized.title) { // Expects query param: ?title=<title>
        const titleToSearch = sanitized.title;
        if (titleToSearch.length < 3) {
            res.status(400).json({'message': 'Title too short to search by. Mininum 3 characters are required.'});
            return;
        }
        foundBooks = await dbService.findBooksForUserRating(currentUserId, titleToSearch);
    } else if (
        sanitized.verified == 'false' || sanitized.username // Expects query params: ?verified=false&username=<username>
    ) {
        // Check if user exists
        const username = sanitized.username;
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

    } else {
        res.status(404).json( {message: `Nothing was found for the provided query.`} );
    }
    res.status(200).json(foundBooks);
});

app.get("/books", [
    query('search').trim().isLength({ min: 3, max: 100 }).escape().blacklist(`=<>'";`)
],
async (req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Search validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const searchString = sanitized.search;

    const searchResult = await dbService.getBooksByPartialTitleOrAuthor(searchString);

    if (searchResult.statusCode === 500) {
        res.satus(500).render('searchResults.ejs');
        return;
    }

    if (searchResult.statusCode === 404) {
        res.status(404).render(
            'searchResults.ejs',
            {
                searchString: searchString,
                results: []
            }
        );
        return;
    }

    res.render(
        'searchResults.ejs',
        {
            searchString: searchString,
            results: searchResult.books
        }
    );

});

app.get("/books/:id",
[
    param('id').trim().isNumeric()
],
async (req, res) => {

    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Search validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const bookId = sanitized.id;

    const book = await dbService.getBookWithAvgRatingAndRatingCount(bookId);
    const ratingsAndNotes = await dbService.getAllRatingsAndNotesByBookId(bookId);
    let hasUserAlreadyRatedIt = false;

    if (isLoggedIn && ratingsAndNotes !== null) {
        hasUserAlreadyRatedIt = ratingsAndNotes.some((rating) => rating.user_id === currentUserId);
    }

    res.render(
        'book.ejs',
        {
            isLoggedIn: isLoggedIn,
            username: currentUser,
            book: book,
            ratingsAndNotes: ratingsAndNotes,
            hasUserAlreadyRatedIt: hasUserAlreadyRatedIt
        }
    )
});

app.post("/books",
[
    body('title').trim().isLength({ max: 100 }).escape().blacklist(`=<>\/\\'";`),
    body('author').trim().isLength({ max: 100 }).escape().blacklist(`=<>\/\\'";`)
],
async (req, res) => {

    if (!isLoggedIn) {
        res.sendStatus(401);
        return;
    }
    
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Book validation errors: ', errors);
        return res.status(400).json({ message: "Validation of user input failed" });
    }

    // Sanitization
    const sanitized = matchedData(req);
    const title = sanitized.title;
    const author = sanitized.author;

    await dbService.createBook(title, author, currentUserId);
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});