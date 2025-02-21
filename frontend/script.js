document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const booksGrid = document.getElementById('books-grid');
    const genresGrid = document.getElementById('genres-grid');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-by');
    const themeToggle = document.getElementById('theme-toggle');
    const totalBooksElement = document.getElementById('total-books');
    const totalGenresElement = document.getElementById('total-genres');
    const menuItems = document.querySelectorAll('.menu li');
    const views = document.querySelectorAll('.view');

    // Modals
    const bookModal = document.getElementById('book-modal');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.querySelector('.close-modal');
    const closeEditModal = document.querySelectorAll('.close-edit-modal');

    // Boutons et formulaires
    const addBookForm = document.getElementById('add-book-form');
    const editBookForm = document.getElementById('edit-book-form');
    const cancelAddButton = document.getElementById('cancel-add');
    const editBookButton = document.getElementById('edit-book');
    const deleteBookButton = document.getElementById('delete-book');

    // Variables d'état
    let books = [];
    let genres = new Map();
    let currentBookId = null;
    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    // Initialisation
    init();

    // Fonction d'initialisation
    function init() {
        loadBooks();
        setupEventListeners();
        applyTheme();
    }

    // Chargement des livres depuis l'API
    function loadBooks() {
        showLoading(booksGrid);

        fetch(`api/books`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des livres');
                }
                return response.json();
            })
            .then(data => {
                books = data;
                updateStatistics();
                displayBooks(books);
                extractGenres(books);
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('Impossible de charger les livres', 'error');
                booksGrid.innerHTML = '<div class="error-message">Impossible de charger les livres. Vérifiez que l\'API est bien démarrée.</div>';
            });
    }

    // Affichage des livres dans la grille
    function displayBooks(booksToDisplay) {
        booksGrid.innerHTML = '';

        if (booksToDisplay.length === 0) {
            booksGrid.innerHTML = '<div class="no-results">Aucun livre trouvé</div>';
            return;
        }

        booksToDisplay.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.dataset.id = book.id;

            bookCard.innerHTML = `
                <div class="book-cover">
                    <div class="book-cover-placeholder">
                        <i class="fas fa-book"></i>
                    </div>
                </div>
                <div class="book-card-content">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">Par ${book.author}</p>
                    <span class="book-genre">${book.genre}</span>
                </div>
            `;

            bookCard.addEventListener('click', () => openBookDetails(book.id));
            booksGrid.appendChild(bookCard);

            // Animation d'apparition
            setTimeout(() => {
                bookCard.style.opacity = '1';
                bookCard.style.transform = 'translateY(0)';
            }, 10);
        });
    }

    // Extraction des genres pour les statistiques et filtres
    function extractGenres(books) {
        genres.clear();

        books.forEach(book => {
            if (genres.has(book.genre)) {
                genres.set(book.genre, genres.get(book.genre) + 1);
            } else {
                genres.set(book.genre, 1);
            }
        });

        updateGenresView();
        updateStatistics();
    }

    // Mise à jour de la vue des genres
    function updateGenresView() {
        genresGrid.innerHTML = '';

        genres.forEach((count, genreName) => {
            const genreCard = document.createElement('div');
            genreCard.className = 'genre-card';
            genreCard.innerHTML = `
                <div class="genre-icon">
                    <i class="fas fa-bookmark"></i>
                </div>
                <h3 class="genre-name">${genreName}</h3>
                <p class="genre-count">${count} livre${count > 1 ? 's' : ''}</p>
            `;

            genreCard.addEventListener('click', () => loadBooksByGenre(genreName));
            genresGrid.appendChild(genreCard);
        });
    }

    // Chargement des livres par genre
    function loadBooksByGenre(genre) {
        showLoading(booksGrid);

        fetch(`api/books/genre/${encodeURIComponent(genre)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur lors du chargement des livres du genre ${genre}`);
                }
                return response.json();
            })
            .then(data => {
                displayBooks(data);
                switchView('books-view');
                showToast(`Affichage des livres du genre: ${genre}`, 'success');
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast(`Erreur lors du chargement des livres du genre ${genre}`, 'error');
            });
    }

    // Mise à jour des statistiques
    function updateStatistics() {
        totalBooksElement.textContent = books.length;
        totalGenresElement.textContent = genres.size;
    }

    // Ouvrir les détails d'un livre
    function openBookDetails(bookId) {
        const book = books.find(b => b.id == bookId);

        if (!book) {
            showToast('Livre non trouvé', 'error');
            return;
        }

        currentBookId = book.id;

        document.getElementById('modal-title').textContent = book.title;
        document.getElementById('modal-author').textContent = book.author;
        document.getElementById('modal-genre').textContent = book.genre;
        document.getElementById('modal-summary').textContent = book.summary;

        bookModal.style.display = 'flex';
    }

    // Configuration pour l'édition d'un livre
    function setupEditBook() {
        const book = books.find(b => b.id == currentBookId);

        if (!book) {
            showToast('Livre non trouvé', 'error');
            return;
        }

        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('edit-title').value = book.title;
        document.getElementById('edit-author').value = book.author;
        document.getElementById('edit-genre').value = book.genre;
        document.getElementById('edit-summary').value = book.summary;

        bookModal.style.display = 'none';
        editModal.style.display = 'flex';
    }

    // Ajouter un nouveau livre
    function addNewBook(event) {
        event.preventDefault();

        const bookData = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            genre: document.getElementById('book-genre').value,
            summary: document.getElementById('book-summary').value
        };

        fetch('api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de l\'ajout du livre');
                }
                return response.json();
            })
            .then(data => {
                showToast('Livre ajouté avec succès', 'success');
                addBookForm.reset();
                switchView('books-view');
                loadBooks();
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('Erreur lors de l\'ajout du livre', 'error');
            });
    }

    // Mettre à jour un livre
    function updateBook(event) {
        event.preventDefault();

        const bookId = document.getElementById('edit-book-id').value;
        const bookData = {
            title: document.getElementById('edit-title').value,
            author: document.getElementById('edit-author').value,
            genre: document.getElementById('edit-genre').value,
            summary: document.getElementById('edit-summary').value
        };

        fetch(`api/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour du livre');
                }
                return response.json();
            })
            .then(data => {
                showToast('Livre mis à jour avec succès', 'success');
                editModal.style.display = 'none';
                loadBooks();
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('Erreur lors de la mise à jour du livre', 'error');
            });
    }

    // Supprimer un livre
    function deleteBook() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
            return;
        }

        fetch(`api/books/${currentBookId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression du livre');
                }
                return response.json();
            })
            .then(data => {
                showToast('Livre supprimé avec succès', 'success');
                bookModal.style.display = 'none';
                loadBooks();
            })
            .catch(error => {
                console.error('Erreur:', error);
                showToast('Erreur lors de la suppression du livre', 'error');
            });
    }

    // Recherche de livres
    function searchBooks() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            displayBooks(books);
            return;
        }

        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm)
        );

        displayBooks(filteredBooks);
    }

    // Tri des livres
    function sortBooks() {
        const sortBy = sortSelect.value;
        let sortedBooks = [...books];

        switch (sortBy) {
            case 'title':
                sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                sortedBooks.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'genre':
                sortedBooks.sort((a, b) => a.genre.localeCompare(b.genre));
                break;
        }

        displayBooks(sortedBooks);
    }

    // Changement de vue
    function switchView(viewId) {
        views.forEach(view => {
            view.classList.add('hidden');
        });

        document.getElementById(viewId).classList.remove('hidden');

        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === viewId.replace('-view', '')) {
                item.classList.add('active');
            }
        });
    }

    // Basculer le thème clair/sombre
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        localStorage.setItem('darkTheme', isDarkTheme);
        applyTheme();
    }

    // Appliquer le thème
    function applyTheme() {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // Afficher un toast de notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} toast-icon"></i>
            <span class="toast-message">${message}</span>
        `;

        const toastContainer = document.getElementById('toast-container');
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slide-out 0.3s ease-out forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Afficher l'indicateur de chargement
    function showLoading(container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Navigation
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                switchView(`${this.dataset.view}-view`);
            });
        });

        // Modals
        closeModal.addEventListener('click', () => {
            bookModal.style.display = 'none';
        });

        closeEditModal.forEach(button => {
            button.addEventListener('click', () => {
                editModal.style.display = 'none';
            });
        });

        window.addEventListener('click', event => {
            if (event.target === bookModal) {
                bookModal.style.display = 'none';
            }
            if (event.target === editModal) {
                editModal.style.display = 'none';
            }
        });

        // Actions sur les livres
        addBookForm.addEventListener('submit', addNewBook);
        editBookForm.addEventListener('submit', updateBook);
        cancelAddButton.addEventListener('click', () => {
            switchView('books-view');
        });
        editBookButton.addEventListener('click', setupEditBook);
        deleteBookButton.addEventListener('click', deleteBook);

        // Recherche et tri
        searchInput.addEventListener('input', searchBooks);
        sortSelect.addEventListener('change', sortBooks);

        // Thème
        themeToggle.addEventListener('click', toggleTheme);
    }
});