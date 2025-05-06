# Groupe: Nermine Khadhraoui, Imene Khlifi, Imane Iguederzen, Sarah 

#Projet Reddit Clone - Backend

## Description
Ce projet backend est une API construite avec Strapi, servant de base pour une plateforme de type Reddit. Il gère les utilisateurs, subreddits, posts, commentaires, et les interactions telles que les likes.

## Technologies utilisées
- Strapi (Headless CMS & API)
- PostgreSQL via Neon (base de données)
- TypeScript (pour le code backend)

## Fonctionnalités principales
- Gestion des utilisateurs avec authentification et rôles (plugin users-permissions de Strapi)
- Gestion des subreddits (thématiques) avec nom et description
- Gestion des posts avec titre, contenu, médias, likes, et relations vers utilisateurs et subreddits
- Gestion des commentaires liés aux posts et aux utilisateurs
- Fonctionnalités de like/unlike sur les posts avec compteur de likes
- Filtrage des posts par subreddit ou auteur
- Endpoint pour récupérer les posts populaires

## Structure des données (schémas principaux)
- **User** : username, email, password, rôle, relations vers posts et commentaires
- **Subreddit** : nom, description, relation vers posts
- **Post** : titre, contenu, médias, compteur de likes, relations vers utilisateur, subreddit, commentaires, likes
- **Comment** : contenu, relation vers post et utilisateur

## Configuration de la base de données
- Supporte PostgreSQL (Neon) configuré via les variables d'environnement :
  - `DATABASE_CLIENT=postgres`
  - `DATABASE_URL` (chaine de connexion)
  - Autres variables pour hôte, port, utilisateur, mot de passe, SSL
