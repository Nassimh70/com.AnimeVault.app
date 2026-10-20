# 🎬 AnimeVault

Application web complète pour gérer ta bibliothèque d'animes — React + TypeScript + Tailwind (frontend) et Node/Express + SQLite (backend).

## 📁 Structure

```
anime-vault/
├── backend/          # API Express + SQLite (better-sqlite3)
│   ├── config/        # Connexion + init de la base de données
│   ├── models/         # Accès aux données (AnimeModel, HistoryModel)
│   ├── controllers/    # Logique métier (CRUD, stats, export, Jikan)
│   ├── routes/          # Endpoints REST
│   ├── middleware/     # Validation + gestion d'erreurs
│   └── database.db     # Créée automatiquement au 1er lancement
└── frontend/         # React + Vite + TypeScript + Tailwind
    └── src/
        ├── components/  # UI réutilisable, layout, composants anime
        ├── pages/        # Dashboard, Liste, Détails, Formulaires, Stats...
        ├── hooks/        # useAnimes (state + appels API)
        ├── services/     # Client API
        └── types/        # Types TypeScript partagés
```

## 🚀 Installation

### 1. Backend

```bash
cd backend
npm install
npm run dev
```
→ API disponible sur `http://localhost:4000` (la base SQLite `database.db` est créée automatiquement au premier lancement).

### 2. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```
→ Application disponible sur `http://localhost:5173` (le proxy Vite redirige `/api` vers le backend).

## ✅ Fonctionnalités incluses

- Dashboard avec statistiques, graphique de répartition, animes récents
- CRUD complet d'animes (SQLite, sauvegarde automatique, aucun bouton "Sauvegarder")
- Recherche automatique via l'API Jikan (MyAnimeList) avec pré-remplissage du formulaire
- Upload d'image locale (stockée dans `backend/uploads/`)
- Vue cartes ET tableau, recherche, filtres (statut, priorité), tri
- Page détails avec progression épisode par épisode (+/-), passage auto en "Terminé"
- Favoris, notes, commentaires, tags
- Statistiques avancées (genres, studios, notes, temps regardé) avec Recharts
- Export JSON et CSV, Import JSON
- Design sombre premium (palette exacte demandée), animations Framer Motion, glassmorphism, toasts, confirmations, skeletons, états vides élégants
- Historique des actions (ajout/modification/suppression/fin) enregistré en base

## 🔜 Non inclus dans cette version (pistes pour la suite)

- Collections/tags avec gestion dédiée en drag & drop
- Vue calendrier
- Raccourcis clavier globaux
- Infinite scroll (remplacé par pagination "Charger plus")
- Mode clair complet (le bouton existe, le thème clair peut être affiné)

## 🛠️ Stack technique

**Frontend** : React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, React Router
**Backend** : Node.js, Express, better-sqlite3, Multer (upload), node-fetch (API Jikan)
