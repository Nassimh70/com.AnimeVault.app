# Anime Vault

Bibliothèque d’animes personnelle, locale et complète : suivi de visionnage, favoris, progression, historique, statistiques, recherche en ligne et imports/exports. L’interface est entièrement en français et adopte le thème **Midnight Library** (nuit bleu-encre et laiton, variante ivoire en mode clair).

## Stack

| Couche | Technologies |
| --- | --- |
| Frontend | Vue 3.5, TypeScript, Vite 6, Pinia, Vue Router 4, Tailwind CSS 3.4 |
| Graphiques | Chart.js 4, vue-chartjs |
| UI | lucide-vue-next, @vueuse/core, polices auto-hébergées (Fraunces, Outfit) |
| Backend | Node.js ≥ 20, Express 4, `mysql2/promise`, zod |
| Sécurité | helmet, CORS restrictif, rate limiting, requêtes SQL paramétrées |
| Base de données | MySQL 8 ou MariaDB (testé localement sur MariaDB 10.4.32 / XAMPP) |
| Tests | `node:test` + supertest (API), Vitest + @vue/test-utils (frontend) |

Aucune dépendance React n’est conservée. Aucune donnée ne quitte le serveur local, hormis les recherches Jikan/AniList lancées explicitement depuis le formulaire.

## Structure du projet

```text
anime-vault/
├── backend/
│   ├── app.js                 # Application Express et montage des routes
│   ├── server.js              # Démarrage, migrations automatiques, arrêt propre
│   ├── config/                # Variables d’environnement, pool MySQL, transactions
│   ├── controllers/           # Réception HTTP et réponses
│   ├── db/
│   │   ├── migrations/        # Schéma SQL versionné (001, 002, ...)
│   │   ├── migrate.js         # Runner de migrations idempotent
│   │   └── import-json.js     # Import idempotent depuis database.json
│   ├── mappers/               # Conversion lignes SQL → objets API
│   ├── middleware/            # Validation, erreurs, rate limit, request id
│   ├── models/                # Uniquement les requêtes SQL
│   ├── routes/                # Définition REST
│   ├── services/              # Règles métier et transactions
│   ├── validators/            # Schémas zod
│   ├── utils/                 # Erreurs, helpers
│   ├── tests/                 # Tests API (node:test + supertest)
│   ├── backups/               # Sauvegardes JSON générées (ignorées par Git)
│   ├── uploads/               # Images importées localement (ignorées par Git)
│   ├── database.json          # Source historique conservée, jamais modifiée
│   └── .env.example           # Modèle de configuration
├── frontend/
│   ├── public/                # Favicon et logo
│   ├── src/
│   │   ├── assets/            # Styles Tailwind et thèmes Midnight Library
│   │   ├── components/        # UI, anime, graphiques, layout
│   │   ├── constants/         # Libellés et options métier
│   │   ├── router/            # Routes et garde de titre
│   │   ├── services/          # Client API typé
│   │   ├── stores/            # Pinia : bibliothèque, réglages, thème, toasts, UI
│   │   ├── tests/             # Tests Vitest classés par domaine
│   │   ├── types/             # Types TypeScript partagés
│   │   ├── utils/             # Formatage et palette des graphiques
│   │   ├── views/             # Dashboard, bibliothèque, détail, formulaire, stats…
│   │   ├── App.vue
│   │   └── main.ts
│   ├── vite.config.ts         # Alias, proxy API, configuration Vitest
│   └── tailwind.config.js
└── README.md
```

Répertoires générés ou locaux, volontairement ignorés par Git : `node_modules/`, `frontend/dist/`, `backend/uploads/*`, `backend/backups/`, `.env`.

## Prérequis

- Node.js **20 ou supérieur** (validé avec Node 24) et npm.
- MySQL 8 ou MariaDB. La version testée est **MariaDB 10.4.32** fournie par XAMPP. Pour une installation durable, préférer MariaDB 10.11+ ou MySQL 8, MariaDB 10.4 étant en fin de vie.
- Les ports `4000` (API), `5173` (Vite) et `3306` (base) libres.

Démarrer MySQL/MariaDB avant le backend (par exemple `C:\xampp\xampp_start.exe` ou le panneau XAMPP).

## Installation

### 1. Backend

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Adapter `backend/.env` si nécessaire :

```dotenv
PORT=4000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=animevault
CORS_ORIGIN=http://localhost:5173
```

Créer les bases (le runner peut créer `animevault` si l’utilisateur en a le droit, mais pas la base de test) :

```sql
CREATE DATABASE animevault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE animevault_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Appliquer le schéma, vérifier puis exécuter l’import historique :

```powershell
npm run db:migrate
npm run db:import-json -- --dry-run
npm run db:import-json
npm run dev
```

L’API répond sur `http://localhost:4000` et `/api/health` doit renvoyer `database: "ok"`. `database.json` est conservé comme source de vérité historique : l’import est idempotent, crée une sauvegarde horodatée dans `backend/backups/`, et ne supprime pas les animes ajoutés ensuite depuis l’interface. Les migrations sont également rejouées automatiquement au démarrage du serveur.

### 2. Frontend

Dans un second terminal :

```powershell
cd frontend
npm ci
npm run dev
```

Ouvrir `http://localhost:5173`. Le proxy Vite redirige `/api` et `/uploads` vers le backend.

Si le port 5173 est occupé, Vite choisit le port suivant ; mettre alors à jour `CORS_ORIGIN` si l’accès est direct au backend.

## Scripts

### Backend

| Commande | Rôle |
| --- | --- |
| `npm run dev` | API en mode watch |
| `npm start` | API en mode normal |
| `npm run db:migrate` | Applique les migrations en attente |
| `npm run db:import-json` | Importe `database.json` (sauvegarde automatique) |
| `npm run db:import-json -- --file <chemin>` | Importe un autre fichier JSON |
| `npm run db:import-json -- --dry-run` | Simule l’import sans écrire |
| `npm test` | Tests API sur `animevault_test` |

### Frontend

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Vérification TypeScript puis build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run lint` | ESLint, zéro avertissement toléré |
| `npm test` | Tests Vitest |
| `npm run test:watch` | Tests en mode watch |

## API REST

Toutes les routes sont préfixées par `/api`. Les erreurs utilisent un format JSON stable (`success: false`, message, éventuel détail de validation) et un `X-Request-Id` est renvoyé.

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/health` | État de l’API et de la base |
| GET | `/animes` | Liste paginée et filtrée |
| GET | `/animes/meta` | Genres, studios, plateformes, années disponibles |
| GET | `/animes/:id` | Détail d’un anime |
| POST | `/animes` | Création |
| PUT | `/animes/:id` | Mise à jour complète |
| DELETE | `/animes/:id` | Suppression d’un anime |
| DELETE | `/animes` | Suppression de toute la collection (action sensible) |
| PATCH | `/animes/:id/progress` | `{ "direction": "increment" \| "decrement" }` ou `{ "episodesWatched": 12 }` |
| PATCH | `/animes/:id/favorite` | `{ "isFavorite": true }` ou `{ "isFavorite": false }` |
| GET | `/animes/:id/history` | Historique d’un anime |
| GET | `/stats` | Agrégats de la collection |
| GET | `/stats/history` | Historique global |
| DELETE | `/stats/history` | Efface l’historique global |
| GET | `/export/json` | Export JSON téléchargeable |
| GET | `/export/csv` | Export CSV (UTF-8 BOM, RFC 4180, protection contre l’injection de formules) |
| POST | `/export/import` | Import JSON depuis l’interface |
| POST | `/upload` | Upload d’image (multipart, 5 Mo maximum) |
| GET | `/jikan/search?q=...` | Recherche Jikan/MyAnimeList avec relais AniList |
| GET | `/settings` | Profil local |
| PUT | `/settings` | Mise à jour du nom affiché |

Paramètres de `GET /animes` : `search`, `status` (`a_voir`, `en_cours`, `termine`, `pause`, `abandonne`), `priority` (`haute`, `moyenne`, `faible`), `genre`, `studio`, `platform`, `year`, `favorite` (`true`/`false`), `sortBy`, `order`, `page`, `limit` (100 maximum).

Exemple :

```bash
curl "http://localhost:4000/api/animes?status=termine&sortBy=rating&order=desc&limit=12"
```

## Sauvegarde et restauration

Les données sont dans MySQL/MariaDB, les images dans `backend/uploads/`. Pour une sauvegarde complète :

```powershell
# Depuis la racine du projet
mysqldump -u root -p --result-file=backend\backups\animevault-2026-10-20.sql animevault
Copy-Item backend\uploads backend\backups\uploads-2026-10-20 -Recurse
```

Restauration via phpMyAdmin ou :

```powershell
cmd /c "mysql -u root -p animevault < backend\backups\animevault-2026-10-20.sql"
```

`backend/database.json` et la sauvegarde présente dans `backend/backups/` doivent être conservés : ils permettent de reconstruire l’import d’origine. Ne jamais modifier `database.json` à la main pendant que l’application tourne.

## Choix techniques

- **SQL uniquement dans `models/`** : les contrôleurs, services et routes ne contiennent aucune requête SQL.
- **Requêtes paramétrées** et échappement des jokers `LIKE` ; les identifiants sont validés comme UUID.
- **Transactions** pour les opérations multi-tables (création avec historique, import, progression).
- **Validation systématique** des corps, paramètres et query strings avec zod.
- **Thèmes** sombre, clair et système, mémorisés dans `localStorage` ; le thème est appliqué avant le rendu pour éviter un flash. Les animations sont désactivables via `prefers-reduced-motion` et le réglage « Réduire les animations ».
- **WCAG AA** : liens d’évitement, libellés explicites, navigation clavier, focus piégé dans les dialogues, contrastes vérifiés, tableaux et graphiques accompagnés de résumés textuels.
- **Responsive** validé à 360, 768, 1024 et 1440 px, sans débordement horizontal.
- **Polices auto-hébergées** avec `@fontsource-variable` : aucun appel à Google Fonts.

## Tests et qualité

```powershell
cd backend
npm test

cd ../frontend
npm test
npm run lint
npm run typecheck
npm run build
```

État de référence de la migration :

- **59 tests backend** (santé, CRUD, validation, filtres, tri, pagination, progression, favoris, historique, imports/exports, statistiques).
- **46 tests frontend** (store bibliothèque, composants, dialogues, client API, formats, vues).
- Lint, typecheck et build sans erreur ni avertissement.
- QA navigateur des neuf routes, thèmes sombre/clair, recherche, filtres, tri, vue cartes/tableau, formulaires, statistiques et navigation mobile.

## Anomalies connues des données d’origine

Ces anomalies proviennent de `backend/database.json` et sont conservées pour ne pas altérer l’historique de l’utilisateur :

- 2 liens non-URL sur la fiche « Attack on titan ».
- Des artefacts `0.5.x` (références de version) dans certains synopsis.
- 5 animes marqués terminés alors que la progression est inférieure au total.
- « Horimiya » a une progression de 15/13 ; les agrégats sont bornés au total d’épisodes pour éviter des statistiques incohérentes.
- 1 entrée d’historique sans `animeId`, importée comme entrée orpheline.
- 125 libellés de studios dans le JSON d’origine, fusionnés en **124** par la collation `utf8mb4_unicode_ci` (« WIT Studio » et « WIT STUDIO »). La casse est volontairement insensible pour les recherches et les filtres.

Les compteurs peuvent évoluer après des ajouts depuis l’interface : l’import ne supprime ni les animes créés par l’utilisateur ni les modifications de profil.

## Dépannage

- `Base de données injoignable` : vérifier que MySQL/MariaDB est démarré et que `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` sont corrects.
- `La base "animevault" n’existe pas` : créer la base et relancer `npm run db:migrate`.
- Erreur CORS : ajouter l’origine exacte du frontend dans `CORS_ORIGIN` (séparateur virgule).
- Les images ne s’affichent pas : vérifier que le backend sert bien `/uploads` et que les fichiers sont présents dans `backend/uploads/`.
- Les tests backend échouent avec une base absente : créer `animevault_test` ; les tests ne touchent jamais la base `animevault`.
