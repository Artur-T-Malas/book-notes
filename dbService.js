export class DbService {
    constructor(dbClient) {
        this.db = dbClient;
    }

    async getUserByUsername(username) {
        try {
            const result = await this.db.query(
                "SELECT * FROM users WHERE username = ($1)",
                [username]
            );
            if (result.rows.length !== 1) {
                console.warn(`User ${username} not found in Db.`);
                return null;
            }
            let user = result.rows[0];
            return user;
        } catch (err) {
            console.log(err);
        }
    }

    async createUser(username, email, passwordHash) {
        try {
            const result = await this.db.query(
                "INSERT INTO users (username, email, password_hash) VALUES (($1), ($2), ($3)) RETURNING id, username;",
                [username, email, passwordHash]
            )
            let addedUser = result.rows[0];
            if (addedUser.username !== username) {
                console.warn("Error while adding user.");
            }
            return addedUser.id;
        } catch (err) {
            console.log(err);
        }
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