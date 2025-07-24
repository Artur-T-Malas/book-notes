export class DbService {
    constructor(dbClient) {
        this.db = dbClient;
    }

    async getBooks() {
        try {
            const result = await this.db.query(
                "SELECT * FROM books ORDER BY title ASC;"
            );
            const books = result.rows;
            console.log('books: ', books);
            return books;
        } catch(err) {
            console.log(err);
        }
    }

    async createBook(title, author) {
        try {
            const result = await this.db.query(
                "INSERT INTO books (title, author) VALUES (($1), ($2)) RETURNING title, author",
                [title, author]
            )
            let addedBook = result.rows[0];
            if (addedBook.title !== title || addedBook.author !== author) {
                console.log("Error while adding book.")
            }
        } catch (err) {
            console.log(err);
        }
    }
}