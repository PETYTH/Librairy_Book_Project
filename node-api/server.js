const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware pour parser le JSON

// Fonction pour essayer de se connecter à MySQL avec retry
const connectWithRetry = () => {
    const db = mysql.createPool({
        host: 'db',
        user: 'root',
        password: 'root',
        database: 'library_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // Vérifier la connexion à la base de données
    db.getConnection((err, connection) => {
        if (err) {
            console.error("❌ Erreur de connexion à MySQL :", err);
            console.log("🔄 Nouvelle tentative dans 5 secondes...");
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log('✅ Connecté à MySQL !');
            connection.release();
        }
    });
    return db;
};

// Connexion à la base de données
const db = connectWithRetry();

app.get("/", (req, res) => {
    res.send("Bienvenue sur mon API Node.js avec Docker !");
});

// 📌 **Route pour ajouter un livre**
app.post('/books', (req, res) => {
    const { title, author, genre, summary } = req.body;
    if (!title || !author || !genre || !summary) {
        return res.status(400).json({ error: 'Veuillez fournir title, author, genre et summary' });
    }
    const query = 'INSERT INTO books (title, author, genre, summary) VALUES (?, ?, ?, ?)';
    db.query(query, [title, author, genre, summary], (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de l'ajout du livre :", err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.status(201).json({ message: '📚 Livre ajouté avec succès', bookId: result.insertId });
    });
});

// 📌 **Route pour récupérer tous les livres**
app.get('/books', (req, res) => {
    const query = 'SELECT * FROM books';
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Erreur lors de la récupération des livres :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

// 📌 **Route pour récupérer un livre par ID**
app.get('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM books WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('❌ Erreur lors de la récupération du livre :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json(results[0]);
    });
});

// 📌 **Route pour mettre à jour un livre par ID**
app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, genre, summary } = req.body;
    if (!title || !author || !genre || !summary) {
        return res.status(400).json({ error: 'Veuillez fournir title, author, genre et summary' });
    }
    const query = 'UPDATE books SET title = ?, author = ?, genre = ?, summary = ? WHERE id = ?';
    db.query(query, [title, author, genre, summary, id], (err, result) => {
        if (err) {
            console.error('❌ Erreur lors de la mise à jour du livre :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json({ message: '✏️ Livre mis à jour avec succès' });
    });
});

// 📌 **Route pour récupérer les livres filtrés par genre**
app.get('/books/genre/:genre', (req, res) => {
    const { genre } = req.params;
    db.query('SELECT * FROM books WHERE genre = ?', [genre], (err, results) => {
        if (err) {
            console.error("❌ Erreur lors de la récupération des livres par genre :", err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: `Aucun livre trouvé pour le genre ${genre}` });
        }
        res.json(results);
    });
});

// 📌 **Route pour supprimer un livre par ID**
app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM books WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('❌ Erreur lors de la suppression du livre :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json({ message: '🗑️ Livre supprimé avec succès' });
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur API démarré sur http://localhost:${port}`);
});
