const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APP';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function isStorageExist() {
    if (typeof Storage === "undefined") {
        alert("Warning! Browser Anda tidak mendukung local storage.");
        return false;
    }
    return true;
}

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYearInput = document.getElementById('bookFormYear').value;
    const bookYear = bookYearInput ? parseInt(bookYearInput.split('-')[0]) : 0;
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

    const id = generateId();
    const bookObject = generateBookObject(id, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            incompleteBookList.append(bookElement);
        } else {
            completeBookList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const container = document.createElement('div');
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');
    container.classList.add('content');

    const titleElement = document.createElement('h3');
    titleElement.setAttribute('data-testid', 'bookItemTitle');
    titleElement.innerText = bookObject.title;

    const authorElement = document.createElement('p');
    authorElement.setAttribute('data-testid', 'bookItemAuthor');
    authorElement.innerText = `Penulis: ${bookObject.author}`;

    const yearElement = document.createElement('p');
    yearElement.setAttribute('data-testid', 'bookItemYear');
    yearElement.innerText = `Tahun: ${bookObject.year}`;

    const containerButton = document.createElement('div');
    containerButton.classList.add('button');

    if (bookObject.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.setAttribute('data-testid', 'bookItemEditButton');
        undoButton.innerText = 'Belum Selesai';
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('trash-button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus';
        deleteButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        containerButton.append(undoButton, deleteButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        checkButton.innerText = 'Selesai Dibaca';
        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('trash-button');
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
        deleteButton.innerText = 'Hapus';
        deleteButton.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        containerButton.append(checkButton, deleteButton);
    }

    container.append(titleElement, authorElement, yearElement, containerButton);

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    return books.find(book => book.id === bookId) || null;
}

function findBookIndex(bookId) {
    return books.findIndex(book => book.id === bookId);
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData !== null) {
        const data = JSON.parse(serializedData);
        books.push(...data);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
});

function searchBook() {
    const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
    if (!searchBookTitle) {
        document.dispatchEvent(new Event(RENDER_EVENT)); // Render semua buku jika input kosong
        return;
    }

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchBookTitle)
    );

    renderSearchedBooks(filteredBooks);
}

function renderSearchedBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            incompleteBookList.append(bookElement);
        } else {
            completeBookList.append(bookElement);
        }
    }
}
