# Book Notes
This repository holds **my** solution for a **Capstone Project** from dr. Angela Yu's [*The Complete Full-Stack Web Development Bootcamp*](https://www.udemy.com/course/the-complete-web-development-bootcamp/).

## TODO
### General
- [ ] Get book covers and display them
- [ ] Style the pages
- [ ] Add a search bar to at least the main page (or all pages)
    * if there are no results:
        - for logged in users -> show the option to add a book
        - for guests -> show a message with login link e.g., "login/register to add the missing book"
    * if there are results generate a new view only with the found books
        - for logged in users -> have a button on each result to rate it IF not yet rated
        - for guests -> simply show the books along with their avg rating and rating count
- [ ] Make the login section and logged/guest user sections into partial views (.ejs) 
    * to get rid of the whole element creation/removal logic from `public/scripts/index.js`
    * to have the login/logout section always visible
- [ ] Document the `/api/books` API
- [ ] Have a limit of the queue of unverified books (e.g., 200 total and 10 per user), don't accept more when the limits are reached
- [ ] add a handler of unmatched rotues and show (enother `.ejs` template) a `404 Not Found` page
- [X] Add data validation and sanitization!
- [X] Hide "Add Book" and "Rate Book" buttons for guest users ~~OR redirect to login page~~
- [X] Invert the logic of hiding buttons - by default show stuff accessible to everyone, and only if user is logged in, show the user-specific stuff
- [X] Rework login/logout section to use EJS template instead of dynamic changes
- [X] Add a link/button to Register on the Login page
- [X] Add a link/button to Login on the Register page
- [X] Use password type input for passwords
- [X] Add either ~~breadcrumbs or~~ "back" links/buttons to Login, Register, Add Book and other subpages
- [X] Make the calls to get login/register pages "GET" requests to /login or /register endpoint. But make the actual login/register requests be "POST" to the same endpoints
- [X] When failing to log in don't redirect to main page, and show an error instead
- [X] Refine the `/api/books` API to be more all-purpose

### For all users
- [ ] When clicking a book, have a notes/rating section
    * separate `.ejs` template for this usecase
    * access it by:
        - clicking on a book in most commonly rated / highest rated list
        - clicking a result from searching on the main page
    * have it on endpoint like `/books/<bookId>`
- [X] See a list of highest rated books and their rating (average of all user ratings)
- [X] See a list of most commonly rated books and their rating (count of all user ratings)
- [X] Rework adding book ratings to work on `book.id` instead of `book.title`

### For logged in users
- [ ] add an option to add, edit and remove notes and ratings to books (only verified)
    * [ ] Modify the `.ejs` template to provide book's ID when rating it from clicking the link on a book page
    * [ ] Show message "Nothing found" if searching didn't find any books
    * [ ] Make the ratings and notes fields disabled until a book is chosen
    * [X] The book title ~~should be choosen either from a filtered drop-down, or be typed in an autocomplete field~~ should be first searched and later selected from a list
    * [X] Add notes and ratings
    * [X] Edit
    * [X] Delete
    * [X] Make sure that a person can have only 1 rating per 1 book
    * [X] Highlight the chosen book
    * [X] Disallow adding duplicate ratings and notes by the same user (do not show the book in the list of books to rate)
- [ ] don't allow adding duplicate books
    * maybe show information about already existing similar titles
- [ ] Add an option to delete the unverified by book by the user who added it
- [ ] have a notification section (new table "notifications") when added book get's accepted/denied (delete either when read (have a button) or after X time from it's creation date)
- [X] add an option to add books to the general database (but not edit nor remove them)
- [X] automatically add a timestamp when a book is added by the user
- [X] Add either a "Cancel" button or "Back to the main page" link to newBook and rateBook pages
- [X] have a section with user-added, unverified books (show them until they're accepted by administrator), no ratings/notes should be possible to be added until they're verified

### For admin(s)
- [ ] add either a new page or section to view books added by users and accept/deny them
- [ ] add option to edit and remove books
- [ ] have a panel to manage users (e.g., delete their accounts, make them admins or take away their admin status)
- [X] the books added by users should be marked accordingly (new column "verified" (yes/no) in table?) and be subject to acceptance of administrators

## How to run this project?
### Disclaimer
>Please pay special attention when running any commands listed in this README file and other places in this repository. <br>Please double check any command which you are not familiar with. <br>Run them at your own responsibility.

### Dependencies
Required:
- Node.js and NPM
- PostgreSQL server or Docker Container with PostgreSQL
- PostgreSL editor (either pgAdmin or DBeaver)

Recommended:
- Nodemon

### Installing project dependencies
All of project dependencies are listed in the `package.json` file. To install them, in your terminal, navigate to project's root directory and run the following commang
```
npm i
```

### [Optional] Setting up PostgreSQL in a Docker Container
This section assumes that Docker is already installed and you have a basic understanding of containers.
1. Pull the **postgres** DOI (Docker Official Image) from Docker Hub.
```
docker pull postgres
```
2. Create a `dbData` folder in a place of your choice (I'd recommend inside of this project directory. Note: `dbData` is already added to `.gitignore`). This folder is going to be used to persist data from PostgreSQL running on the container.
3. Run the container with the following command. This command will also map the container's port `5432` to your computer's port `5432`, and persist the DB data in the `<your-dbData-folder-path>` folder. `--rm` flag will remove the container after it's stopped, and `-d` will run it in a detached state.
```
docker run --rm -d -p 5432:5432 -v <your-dbData-folder-path>:/var/lib/postgresql/data --name <container-name> -e POSTGRES_PASSWORD=<choose-password-for-postgres> postgres
```

### Setting up the database
1. In the SQL Editor of your choosing, connect to default Postgres database `postgres`. The default value for user is also `postgres`, and port is by default `5432`. Use the password which you've chosen when setting PostgreSQL up.
2. Create a new database called `book_notes`.
3. Open SQL Script Editor and run commands from `queries.sql` file one by one.
> NOTE: The default `admin` user created during step 3 will have a password of `test123`

### `config.js` file
The provided `config-example.js` file must be copied and renamed to `config.js`. Correct values must be put in place of the placeholders.

### Running the project
After all of above are done, to run the project simply navigate to it's root directory in the terminal and run **one of the following** commands:
```
npm start
node index.js
nodemon index.js
```

## Changelog
### 24.07.2025
- Started work on the project
- Add basic functionality for adding and retrieving books from DB and displaying on the frontend
- Added basic functionality for creating users and separation of admins from "normal" users
- Created basic tables in SQL

### 25.07.2025
- Modify endpoints meant for serving subpages to work on GET requests
- Make the endpoints for login and register /login and /register respectively, with GET method for getting the login/register page, and POST method for the actual action
- Standardize endpoint naming
- Fix auth issue causing invalid registration to work as a user logged in succesfully
- Fix missing `is_admin` parameter when creating users after registration
- Minor changes to README.md
- Invert button visibility logic: show public by default, reveal user-specific when logged in
- Add warning icon to the login/register warning

## 26.07.2025
- Added "Back to main page" links to login and register subpages

## 29.07.2025
- Reworked adding ratings
    * Added "Search" function instead of typing the book title manually
    * After searching, book can be selected from a list
    * Made the "Search" button disabled if input is less than 3 characters long
    * Backend will refuse to search and return `400` if the request has a `title` query parameter with less than 3 characters
    * Created new API `/books` on the backend, which expects a query parameter `title` (can be whole or partial and is case insensitive) and returns the list of books user can rate
- Added "Most commonly rated books" section on the home page
- Limited the number of books in both "Most commonly rated books" and "Highest rated books" sections to 6 each
- Fix unrated books being treated as having a rating of 0/10

## 30.07.2025
- Automatically add timestamp and user's ID when creating books
- Modify `/books` API to add returning of unverified books for the current user based on the request's query params
- Made the logout a POST request to `/logout`

## 31.07.2025
- Add searching for users' unverified books to `/books` API
- Add a section for logged in users to see the unverified books they've added
- Reworked the `index.ejs` and `public/scripts/index.js` to rely more on the EJS templates rather than dynamic DOM manipulation

## 01.08.2025
- Alter `user_book_notes` to contain rating/note creation and modification dates
- Automatically add creation and modification dates to newly added book ratings and notes
- Show the users' rated books in the appropriate section
- Add links back to main page and "Cancel" buttons to book adding and rating subpages
- Create a DbService method to get a book by its id
- Create a DbService method to get a book by the rating id

## 02.08.2025
- Add the option to edit and delete ratings and notes

## 04.08.2025
- Rework login, validate and sanitize data on the backend, validate form data in the frontend
- Rework register, validate and sanitize data on the backend, validate form data in the frontend

## 05.08.2025
- Add validation, sanitization and duplicate prevention to adding and editing ratings
    * Fix sanitization by using `matchedData` from `express-validator` instead of relying on modification of `req` in-place
- Modified adding of ratings to work on book ID instead of title
- Add validation and sanitization of all user inputs
- Create query to be used for the search bar (searching books by partial title or author name)
- Create query for getting all user notes and ratings for a book
- Move the `/books` API to `/api/books` endpoint
- Add search function (by the partial title or author name) on the main page
