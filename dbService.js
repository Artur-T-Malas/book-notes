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

    async isEmailAlreadyUsed(email) {
        try {
            const result = await this.db.query(
                `
                SELECT username, email FROM USERS
                WHERE email = ($1)
                `,
                [email]
            );
            if (result.rows.length === 0) {
                return false;
            }
            return true;
        } catch (err) {
            console.error('Error while searching for an email: ', err);
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

    async getBookWithAvgRatingAndRatingCount(id) {
        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, AVG(ubn.rating) AS avg_rating, COALESCE(COUNT(ubn.rating), 0) AS times_rated
                FROM books b
                LEFT JOIN user_book_notes ubn
                    ON ubn.book_id = b.id
                WHERE b.id=($1)
                GROUP BY b.id
                `, [id]
            );
            if (result.rows.length === 0) {
                console.warn(`No book found with id ${id}`);
                return null;
            }
            let book = result.rows[0];
            book.avg_rating = book.avg_rating > 0 ? `${parseInt(book.avg_rating)}/10` : 'Not rated yet';
            book.times_rated = book.times_rated != 0 ? parseInt(book.times_rated) : 'No ratings yet';
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
                SELECT b.id, b.title, b.author, ubn.rating, ubn.notes, ubn.date_added, ubn.date_modified
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

    async getBooksByPartialTitleOrAuthor(searchString) {
        /*
        Searches for books by either partial title or author name.
        The search string is case insensitive.
        */
        const lowerCaseSearchString = `%${searchString.toLowerCase()}%`;

        try {
            const result = await this.db.query(
                `
                SELECT b.id, b.title, b.author, COALESCE(AVG(ubn.rating), 0) as avg_rating, COALESCE(COUNT(ubn.rating), 0) as times_rated
                FROM books b
                LEFT JOIN user_book_notes ubn
                    ON b.id = ubn.book_id
                WHERE b.verified = 'true'
                    AND (
                        LOWER(b.title) LIKE ($1)
                        OR LOWER(b.author) LIKE ($1)
                    )
                GROUP BY b.id
                ORDER BY b.title, b.author;
                `, [lowerCaseSearchString]
            );
            if (result.rows.length === 0) {
                return { success: false, statusCode: 404 };
            }
            const foundBooks = result.rows;
            foundBooks.forEach((book) => {
                book.avg_rating = book.avg_rating != 0 ? `${parseInt(book.avg_rating)}/10` : 'Not rated yet';
            });
            return { success: true, statusCode: 200, books: foundBooks };
        } catch (err) {
            console.error('Error while searching books: ', err);
            return { success: false, statusCode: 500 };
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

    async getAllRatingsAndNotesByBookId(bookId) {
        try {
            const result = await this.db.query(
                `
                SELECT u.id AS user_id, u.username, ubn.rating, ubn.notes, ubn.date_modified FROM user_book_notes ubn
                JOIN users u
                    ON u.id = ubn.user_id
                WHERE ubn.book_id = ($1)
                ORDER BY ubn.date_modified DESC;
                `, [bookId]
            );
            if (result.rows.length === 0) {
                return null;
            }
            const ratingsAndNotes = result.rows;
            return ratingsAndNotes;
        } catch (err) {
            console.error(`Error getting ratings for book ID ${bookId}: `, err);
            return null;
        }
    }

    async getUserBookNotesByUserAndBookId(userId, bookId) {
        try {
            const result = await this.db.query(
                `
                SELECT * FROM user_book_notes ubn
                WHERE ubn.user_id = ($1) AND ubn.book_id = ($2);
                `, [userId, bookId]
            );
            const resultCount = result.rows.length;
            if (resultCount === 0) {
                return null;
            }
            if (resultCount > 1) {
                console.warn(`There are ${resultCount} ratings for book ID ${bookId} and user ID ${userId}.`);
                return null;
            }
            const userBookNotes = result.rows[0];
            return userBookNotes;
        } catch (err) {
            console.error('Failed getting user book notes from userId and bookId: ', err);
            return null;
        }
    }

    async addRatingAndNotes(userId, bookId, rating, notes) {
        const dateAdded = new Date().toISOString();
        const dateModified = dateAdded;
        try {
            let result = await this.db.query(
                'SELECT * FROM books WHERE id=($1);',
                [bookId]
            );
            if (result.rows.length < 1) {
                throw new Error(`No book with ID "${bookId}" found in database.`);
            }
            result = await this.db.query(
                `
                INSERT INTO user_book_notes (user_id, book_id, rating, notes, date_added, date_modified)
                VALUES (($1), ($2), ($3), ($4), ($5), ($6))
                RETURNING user_id, book_id;
                `,
                [userId, bookId, rating, notes, dateAdded, dateModified]
            );
            const addedNotes = result.rows[0];
            if (bookId != addedNotes.book_id || userId != addedNotes.user_id) {
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