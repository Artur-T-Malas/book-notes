import express from "express";
import axios from "axios";
import pg from "pg";
import { config } from "./config.js"
import { DbService } from "./dbService.js";

const app = express();
const port = 3000;
const db = new pg.Client(config.dbConfig);
db.connect()
    .then(() => console.log(`Connected to DB ${config.dbConfig.database}`))
    .catch(err => console.log('DB Connection Error: ', err));
const dbService = new DbService(db);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    books = await dbService.getBooks();
    res.render(
        'index.ejs',
        { books: books }
    );
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