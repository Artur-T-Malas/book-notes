-- Create table for users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    is_admin BOOLEAN NOT NULL
);

-- Create table for books
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200) NOT NULL,
    verified BOOLEAN NOT NULL,
    added_by_user_id INTEGER REFERENCES users(id),
    UNIQUE(title, author)
);

-- Insert example books into the table
INSERT INTO books (title, author, verified) VALUES
    ('The Lord of the Rings', 'J.R.R. Tolkien', 'true'),
    ('Star Wars Thrawn', 'Timothy Zahn', 'true');

-- Create table for storing user notes and ratings
CREATE TABLE user_book_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    book_id INTEGER REFERENCES books(id) NOT NULL,
    rating INTEGER,
    notes TEXT,
    UNIQUE(user_id, book_id)
);

-- Get average ratings of verified books, sorted by highest rated
SELECT b.title, b.author, AVG(ubn.rating) AS avg_rating FROM books b
LEFT OUTER JOIN user_book_notes ubn
	ON b.id = ubn.book_id
WHERE b.verified = 'true'
GROUP BY b.id
ORDER BY avg_rating DESC;