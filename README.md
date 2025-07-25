# Book Notes
This repository holds **my** solution for a **Capstone Project** from dr. Angela Yu's [*The Complete Full-Stack Web Development Bootcamp*](https://www.udemy.com/course/the-complete-web-development-bootcamp/).

## TODO
General
- [ ] Add data validation and sanitization!
- [ ] Get book covers and display them
- [ ] Style the pages
- [X] Hide "Add Book" and "Rate Book" buttons for guest users ~~OR redirect to login page~~
- [ ] Invert the logic of hiding buttons - by default show stuff accessible to everyone, and only if user is logged in, show the user-specific stuff
- [ ] Add a link/button to Register on the Login page
- [ ] Add a link/button to Login on the Register page
- [ ] Use password type input for passwords
- [ ] Add either breadcrumbs or "back" links/buttons to Login, Register, Add Book and other subpages

For all users:
- [X] See a list of highest rated books and their rating (average of all user ratings)
- [ ] See a list of most commonly rated books and their rating (average of all user ratings)

For logged in users:
- [ ] add an option to add, edit and remove notes and ratings to books (only verified)
    * [ ] The book title should be choosen either from a filtered drop-down, or be typed in an autocomplete field
    * [X] Add notes and ratings
    * [ ] Edit
    * [ ] Delete
- [X] add an option to add books to the general database (but not edit nor remove them)
- [ ] have a section with user-added, unverified books (show them until they're accepted by administrator), no ratings/notes should be possible to be added until they're verified
- [ ] have a notification section (new table "notifications") when added book get's accepted/denied (delete either when read (have a button) or after X time from it's creation date)

For admin(s):
- [X] the books added by users should be marked accordingly (new column "verified" (yes/no) in table?) and be subject to acceptance of administrators
- [ ] add either a new page or section to view books added by users and accept/deny them
- [ ] add option to edit and remove books
- [ ] have a panel to manage users (e.g., delete their accounts, make them admins or take away their admin status)

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
### 24.07.2024
- Started work on the project
- Add basic functionality for adding and retrieving books from DB and displaying on the frontend
- Added basic functionality for creating users and separation of admins from "normal" users
- Created basic tables in SQL

### 25.07.2024
- Modify endpoints meant for serving subpages to work on GET requests
- Standardize endpoint naming
- Fix auth issue causing invalid registration to work as a user logged in succesfully
- Fix missing `is_admin` parameter when creating users after registration
- Minor changes to README.md