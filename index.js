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

// Example for now
let books = [
    {id: 1, title: "The Lord of the Rings", author: "J.R.R. Tolkien"},
    {id: 2, title: "Star Wars Thrawn", author: "Timothy Zahn"}
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    books = await dbService.getBooks();
    res.render(
        'index.ejs',
        { books: books }
    );
});


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});