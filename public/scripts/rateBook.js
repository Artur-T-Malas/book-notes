let bookIdInput = document.getElementById('book-id-input');
let bookTitleInput = document.getElementById('book-title-input');
let ratingForm = document.getElementById('rating-form')
let ratingRange = document.getElementById('book-rating-range');
let ratingPreview = document.getElementById('rating-preview');
ratingRange.addEventListener('input', (event) => {
    ratingPreview.innerText = ratingRange.value;
});
let bookFindingPanel = document.getElementById('book-finding-panel');
let booksSearchInput = document.getElementById('book-search-title-input');
booksSearchInput.addEventListener('input', disableSearchBtn);
let booksSearchBtn = document.getElementById('books-search-btn');
let foundBooksList = document.getElementById('found-books-list');

let foundBooks = [];

function chooseBook(event) {
    /*
    This function inputs the book's id
    into the hidden input and the book's title
    into the disabled text input.
    */

    // TODO: Make the rating and notes fields disabled until a book is chosen
    // TODO: Highlight the chosen book
    const srcElement = event.srcElement;
    const btnValue = parseInt(srcElement.value);
    const bookId = btnValue;
    let book = foundBooks.find((book) => book.id === bookId);

    bookTitleInput.type = 'text';
    bookTitleInput.value = book.title;
    bookIdInput.value = book.id;

    booksSearchInput.value = ''; // Clear the search box
    foundBooksList.replaceChildren(); // Clear the list of found books
}

function disableSearchBtn(event) {
    if (booksSearchInput.value.length <= 2) {
        booksSearchBtn.disabled = true;
    } else {
        booksSearchBtn.disabled = false;
    }
}


async function getBooks(event) {
    /*
    This function calls the /books API
    with the whole or partial title
    (inputted by the user in the book-title-input
    HTML Input element) as query parameter.
    */
    const titleToSearch = booksSearchInput.value;
    const url = "/api/books";
    const params = new URLSearchParams();
    params.append("title", titleToSearch);
    const response = await fetch(`${url}?${params}`);
    foundBooks = await response.json();

    foundBooksList.replaceChildren();
    
    foundBooks.forEach(book => {
        let singleBookDiv = document.createElement('div');
        singleBookDiv.id = `book-${book.id}`;
        singleBookDiv.classList.add('book-card');
        foundBooksList.appendChild(singleBookDiv);
        
        let selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.id = `select-btn-${book.id}`;
        selectBtn.value = book.id;
        selectBtn.innerText = 'Select';
        selectBtn.addEventListener('click', chooseBook);
        singleBookDiv.appendChild(selectBtn);

        let bookInfo = document.createElement('p');
        bookInfo.innerText = `${book.title} | ${book.author}`;
        singleBookDiv.appendChild(bookInfo);
    });
}

booksSearchBtn.addEventListener('click', getBooks);