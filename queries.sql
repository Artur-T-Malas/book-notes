-- Create table for books
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(200) NOT NULL,
    UNIQUE(title, author)
);

-- Insert example books into the table
INSERT INTO books (title, author) VALUES
    ('The Lord of the Rings', 'J.R.R. Tolkien'),
    ('Star Wars Thrawn', 'Timothy Zahn');

-- Create table for users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(200) UNIQUE,
    password_hash VARCHAR(200)
);