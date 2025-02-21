CREATE TABLE IF NOT EXISTS books (
                                     id INT AUTO_INCREMENT PRIMARY KEY,
                                     title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL
    );

INSERT INTO books (title, author, genre, summary) VALUES
                                                      ('Clean Code', 'Robert C. Martin', 'Tech',
                                                       'Un guide sur les bonnes pratiques de programmation et l\'importance du code propre.'),

    ('Harry Potter et la pierre philosophale', 'J.K. Rowling', 'Fantasy',
     'Le premier tome de la célèbre saga où Harry découvre qu\'il est un sorcier et entre à Poudlard.'),

                                                      ('Les Misérables', 'Victor Hugo', 'Classique',
                                                       'Un roman historique et social sur la misère, l\'injustice et la rédemption à travers l\'histoire de Jean Valjean.'),

                                                      ('Le Seigneur des Anneaux', 'J.R.R. Tolkien', 'Fantasy',
                                                       'L\'épopée fantastique où un groupe de héros tente de détruire l\'Anneau Unique pour sauver la Terre du Milieu.'),

                                                      ('Design Patterns', 'Erich Gamma', 'Tech',
                                                       'Un ouvrage qui explique les modèles de conception en programmation orientée objet, indispensables pour tout développeur.');