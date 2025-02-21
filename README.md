# Librairy_Book_Project avec Docker

Cette application est constituée d'un frontend, d'une API Node.js et d'une base de données MySQL, le tout orchestré avec Docker Compose.

## Architecture

L'application est divisée en trois services principaux :
- **Frontend** : Interface utilisateur servie par Nginx
- **API** : Backend Node.js
- **Base de données** : MySQL 8

## Prérequis

- Docker
- Docker Compose
- Git (pour cloner le repository)

## Structure du Projet

```
.
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── script.js
│   └── style.css
├── node-api/
│   ├── Dockerfile
│   ├── server.js
│   └── package.json
└── db-init/
    └── init.sql
```

## Configuration Réseau

L'application utilise deux réseaux Docker :
- `backend_network` : Réseau privé entre l'API et la base de données
- `frontend_network` : Réseau permettant au frontend d'accéder à l'API

## Installation et Démarrage

1. Clonez le repository :
```bash
git clone <https://github.com/PETYTH/Librairy_Book_Project.git>
cd <Librairy_Book_Project>
```

2. Construisez et démarrez les conteneurs :
```bash
docker-compose up --build
```

3. Accédez à l'application :
- Frontend : http://localhost:8080
- L'API est accessible sur le port 3000 (en interne uniquement)

## Configuration des Services

### Base de données MySQL
- Port : 3306 (interne)
- Base de données : library_db
- Utilisateur root par défaut
- Les données sont persistantes grâce au volume `db_data`
- Le schéma initial est chargé depuis `db-init/init.sql`

### API Node.js
- Port : 3000 (exposé uniquement aux autres services)
- Dépend de la disponibilité de la base de données
- Les dépendances sont gérées via package.json

### Frontend
- Port : 8080 (accessible publiquement)
- Servi par Nginx
- Configuration Nginx personnalisée via nginx.conf

## Arrêt de l'Application

Pour arrêter l'application :
```bash
docker-compose down
```

Pour arrêter l'application et supprimer les volumes :
```bash
docker-compose down -v
```

## Logs et Debugging

Visualiser les logs de tous les services :
```bash
docker-compose logs
```

Logs d'un service spécifique :
```bash
docker-compose logs [service]
# Exemple : docker-compose logs api
```

## Notes de Développement

Pour le développement local :
1. Les modifications du code frontend sont à effectuer dans le dossier `frontend/`
2. Les modifications de l'API sont à effectuer dans le dossier `node-api/`
3. Les modifications du schéma de base de données sont à effectuer dans `db-init/init.sql`

Après modification des fichiers, reconstruisez les conteneurs :
```bash
docker-compose up --build
```