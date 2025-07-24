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
}