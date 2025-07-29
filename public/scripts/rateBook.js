let bookIdInput = document.getElementById('book-id-input');
let bookTitleInput = document.getElementById('book-title-input');
let ratingRange = document.getElementById('book-rating-range');
let ratingPreview = document.getElementById('rating-preview');
ratingRange.addEventListener('input', (event) => {
    console.log('ratingRange.value: ', ratingRange.value);
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
    console.log('event: ', event);
    const srcElement = event.srcElement;
    console.log('srcElement: ', srcElement);
    const btnValue = parseInt(srcElement.value);
    const bookId = btnValue;
    console.log('btnValue', btnValue, typeof btnValue);
    let book = foundBooks.find((book) => book.id === bookId);
    console.log('book: ', book);
    bookTitleInput.value = book.title;
    bookIdInput.value = book.id;
}

function disableSearchBtn(event) {
    console.log('disableSearchBtn triggered, event: ', event);
    console.log('value: ', booksSearchInput.value);
    console.log('value.length: ', booksSearchInput.value.length);
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
    const url = "/books";
    const params = new URLSearchParams();
    params.append("title", titleToSearch);
    const response = await fetch(`${url}?${params}`);
    foundBooks = await response.json();
    console.log('foundBooks: ', foundBooks);

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