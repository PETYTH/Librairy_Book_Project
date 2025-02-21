# 1 Utiliser une image de base
FROM node:18-alpine

# 2 Définir le dossier de travail
WORKDIR /app

# 3 Copier les fichiers du projet
COPY package.json package-lock.json ./
RUN npm install --only=production

# 4 Copier le reste des fichiers
COPY . .

# 5 Exposer le port utilisé par l’API
EXPOSE 3000

# 6 Démarrer le serveur Node.js
CMD ["node", "server.js"]