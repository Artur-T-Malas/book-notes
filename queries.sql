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