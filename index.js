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
let currentUser = '';
let isLoggedIn = false;

app.get("/", async (req, res) => {
    books = await dbService.getHighestRatedBooks();
    res.render(
        'index.ejs',
        {
            isLoggedIn: isLoggedIn,
            username: currentUser,
            books: books
        }
    );
});

app.post("/login", (req, res) => {
    res.render('login.ejs');
});

app.post("/register", (req, res) => {
    res.render('register.ejs');
});

app.post("/logout", (req, res) => {
    isLoggedIn = false;
    currentUser = '';
    res.redirect('/');
});

app.post("/userLogin", async (req, res) => {
    // TODO: Validate and sanitize input
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    isLoggedIn = await authService.loginUser(username, password);
    currentUser = username;
    res.redirect('/');
});

app.post("/userRegister", async (req, res) => {
    // TODO: Validate and sanitize input
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    await authService.registerUser(username, email, password);
    isLoggedIn = true;
    currentUser = username;
    res.redirect('/')
});

app.post("/newBook", (req, res) => {
    res.render('newBook.ejs');
});

app.post("/books", async (req, res) =>{
    // TODO: Validate and sanitize input
    const title = req.body.title;
    const author = req.body.author;
    await dbService.createBook(title, author);
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});