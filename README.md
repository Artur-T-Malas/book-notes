# Book Notes
This repository holds **my** solution for a **Capstone Project** from dr. Angela Yu's [*The Complete Full-Stack Web Development Bootcamp*](https://www.udemy.com/course/the-complete-web-development-bootcamp/).

## TODO
General
[ ] Get book covers and display them
[ ] Style the pages

For guest users:
[ ] See a list of most commonly rated books and their rating (average of all user ratings)

For logged in users:
[ ] add an option to add, edit and remove notes to books (only verified)
[ ] add an option to add, edit and remove ratings to books (only verified books, ratings should be separate from notes)
[ ] add an option to add books to the general database (but not edit nor remove them)
[ ] have a section with user-added, unverified books (show them until they're accepted by administrator), no ratings/notes should be possible to be added until they're verified
[ ] have a notification section (new table "notifications") when added book get's accepted/denied (delete either when read (have a button) or after X time from it's creation date)

For admin(s):
[ ] the books added by users should be marked accordingly (new column "verified" (yes/no) in table?) and be subject to acceptance of administrators
[ ] add either a new page or section to view books added by users and accept/deny them
[ ] add option to edit and remove books

## How to run this project?
### Dependencies
Required:
- Node.js and NPM
- PostgreSQL server and editor (either pgAdmin or DBeaver)

Recommended:
- Nodemon

### Installing project dependencies
All of project dependencies are listed in the `package.json` file. To install them, in your terminal, navigate to project's root directory and run the following commang
```
npm i
```

### `config.js` file
The provided `config-example.js` file must be copied and renamed to `config.js`. Correct values must be put in place of the placeholders.

### Running the project
After all of above are done, to run the project simply navigate to it's root directory in the terminal and run **one of the following** commands:
```
npm start
node index.js
nodemon index.js
```
