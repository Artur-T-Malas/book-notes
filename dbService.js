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
            console.error(err);
        }
    }

    async getUserFromRatingAndNotes(ratingId) {
        try {
            const result = await this.db.query(
                `
                SELECT u.id, u.username, u.email FROM users u
                INNER JOIN user_book_notes ubn
                    ON u.id = ubn.user_id
                WHERE ubn.id = ($1);
                `, [ratingId]
            );
            if (result.rows.length === 0) {
                console.error(`Rating ID ${ratingId} not found.`);
                return { success: false, statusCode: 404 };
            }
            if (result.rows.length > 1) {
                console.error(`[CRITICAL] More than 1 rating found for ID ${ratingId}`);
                return { success: false, statusCode: 500 };
            }
            const user = result.rows[0];
            return { success: true, statusCode: 200, user: user };
        } catch (err) {
            console.error(err);
        }
    }

    async createUser(username, email, passwordHash) {
        try {
            const result = await this.db.query(
                "INSERT INTO users (username, email, password_hash, is_admin) VALUES (($1), ($2), ($3), 'false') RETURNING id, username;",
                [username, email, passwordHash]
            )
            let addedUser = result.rows[0];
            if (addedUser.username !== username) {
                console.warn("Error while adding user.");
                return null;
            }
            return addedUser.id;
        } catch (err) {
            console.error(err);
        }
    }

    async getBooks() {
        try {
            const result = await this.db.query(
                "SELECT * FROM books WHERE verified='true' ORDER BY title ASC;"
            );
            const books = result.rows;
            return books;
        } catch(err) {
            console.error(err);
        }
    }

    async getBook(id) {
        try {
            const result = await this.db.query(
                "SELECT * FROM books WHERE id=($1)",
                [id]
            );
            const book = result.rows[0];
            return book;
        } catch (err) {
            console.error(err);
        }
    }

    async getBookByRatingId(id) {
        try {
            const result = await this.db.query(
                `
                SELECT * FROM books b
                INNER JOIN user_book_notes ubn
                    ON b.id = ubn.book_id
                WHERE ubn.id = ($1);
                `,
                [id]
            )
            const book = result.rows[0];
            return book;
        } catch (err) {
            console.error(err);
        }
    }

    async getHighestRatedBooks() {
        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, COALESCE(AVG(ubn.rating), 0) AS avg_rating FROM books b
                LEFT OUTER JOIN user_book_notes ubn
                ON b.id = ubn.book_id
                WHERE b.verified = 'true'
                GROUP BY b.id
                ORDER BY avg_rating DESC, title ASC
                LIMIT 6;
                `
            );
            const ratedBooks = result.rows;
            ratedBooks.forEach((book) => {
                book.avg_rating = book.avg_rating != 0 ? `${parseInt(book.avg_rating)}/10` : 'Not rated yet';
            });
            return ratedBooks;
        } catch (err) {
            console.error(err);
        }
    }

    async getMostRatedBooks() {
        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, COALESCE(COUNT(ubn.rating), 0) AS times_rated FROM books b
                LEFT OUTER JOIN user_book_notes ubn
                ON b.id = ubn.book_id
                WHERE b.verified = 'true'
                GROUP BY b.id
                ORDER BY times_rated DESC, title ASC
                LIMIT 6;
                `
            );
            const mostCommonlyRatedBooks = result.rows;
            mostCommonlyRatedBooks.forEach((book) => {
                book.times_rated = book.times_rated != 0 ? parseInt(book.times_rated) : 'No ratings yet';
            });
            return mostCommonlyRatedBooks;
        } catch (err) {
            console.error(err);
        }
    }

    async createBook(title, author, userId) {
        try {
            const dateAdded = new Date().toISOString();
            const result = await this.db.query(
                "INSERT INTO books (title, author, verified, added_by_user_id, date_added) VALUES (($1), ($2), 'false', ($3), ($4)) RETURNING title, author",
                [title, author, userId, dateAdded]
            );
            let addedBook = result.rows[0];
            if (addedBook.title !== title || addedBook.author !== author) {
                console.error("Error while adding book.")
            }
        } catch (err) {
            console.error(err);
        }
    }

    async getUserRatedBooks(userId) {
        try {
            const dateAdded = new Date().toISOString();
            const dateModified = dateAdded;
            const result = await this.db.query(
                `
                SELECT ubn.id, b.title, b.author, ubn.rating, ubn.notes, ubn.date_added, ubn.date_modified
                FROM books b
                INNER JOIN user_book_notes ubn
                    ON b.id = ubn.book_id
                WHERE ubn.user_id = ($1)
                `,
                [userId]
            );
            const userRatedBooks = result.rows;
            return userRatedBooks;
        } catch (err) {
            console.error(err);
        }
    }

    async findBooksForUserRating(userId, titleToSearch) {
        /*
        Returns books based on user's ID and the partial or whole
        title to search for.
        */
        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, b.verified
                FROM books b
                LEFT JOIN user_book_notes ubn
                ON b.id = ubn.book_id AND ubn.user_id = ($1)
                WHERE ubn.book_id IS NULL
                    AND b.verified = 'true'
                    AND LOWER(b.title) LIKE ($2);
                `,
                [userId, `%${titleToSearch.toLowerCase()}%`]
            );
            const foundBooks = result.rows;
            return foundBooks;
        } catch (err) {
            console.error(err);
        }
    }

    async getUserUnverifiedBooks(userId) {
        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, b.date_added
                FROM books b
                WHERE added_by_user_id = ($1)
                    AND verified = 'false'
                ORDER BY b.date_added DESC, b.title ASC;
                `,
                [userId]
            )
            const userUnverifiedBooks = result.rows;
            return userUnverifiedBooks;
        } catch (err) {
            console.error(err);
        }
    }

    async getUserBookNotes(id) {
        try {
            const result = await this.db.query(
                `
                SELECT * FROM user_book_notes ubn
                WHERE ubn.id = ($1);
                `, [id]
            );
            if (result.rows.length === 0) {
                console.error(`Could not find rating ${id}`);
                return { success: false, statusCode: 404 };
            }
            const rating = result.rows[0];
            return { success: true, statusCode: 200, rating: rating };
        } catch (err) {
            console.error(err);
        }
    }

    async addRatingAndNotes(userId, bookTitle, rating, notes) {
        const dateAdded = new Date().toISOString();
        const dateModified = dateAdded;
        try {
            let result = await this.db.query(
                'SELECT id FROM books WHERE title=($1);',
                [bookTitle]
            );
            if (result.rows.length < 1) {
                throw new Error(`No book with title "${bookTitle}" found in database.`);
            }
            const bookId = result.rows[0].id;
            result = await this.db.query(
                `
                INSERT INTO user_book_notes (user_id, book_id, rating, notes, date_added, date_modified)
                VALUES (($1), ($2), ($3), ($4), ($5), ($6))
                RETURNING book_id;
                `,
                [userId, bookId, rating, notes, dateAdded, dateModified]
            );
            const addedNotesBookId = result.rows[0].book_id
            if (bookId !== addedNotesBookId) {
                console.warn('Failed adding notes to book.');
            }
        } catch (err) {
            console.error(err);
        }
    }

    async updateUserBookNotes(id, rating, notes) {
        const dateModified = new Date().toISOString();

        try{
            const result = await this.db.query(
                `
                UPDATE user_book_notes ubn
                SET rating = ($1), notes = ($2), date_modified = ($3)
                WHERE ubn.id = ($4)
                RETURNING ubn.id;
                `, [rating, notes, dateModified, id]
            );
            if (result.rows.length === 0) {
                console.error(`Could not find rating ${id}`);
                return { success: false, statusCode: 404 };
            }
            const ratingId = result.rows[0].id;
            return { success: true, statusCode: 200, ratingId: ratingId };
        } catch(err) {
            console.error(err);
        }
    }

    async deleteRatingAndNotes(id) {
        try {
            const result = await this.db.query(
                `
                DELETE FROM user_book_notes ubn
                WHERE ubn.id = ($1)
                RETURNING ubn.id;
                `,
                [id]
            );
            if (result.rows.length === 0) {
                console.error(`Failed deleting rating ${id}`);
                return { success: false };
            }
            const ratingId = result.rows[0].id;
            if (ratingId != id) {
                console.error(
                    `[CRITICAL] An error has happened during deleting.
                    Wrong rating was deleted! Was supposed
                    to delete ${id} but deleted ${ratingId}`
                );
                return { success: false, wrongDeletion: true };
            }
            return { success: true, ratingId: ratingId };
        } catch (err) {
            console.error(err);
        }
    }
}