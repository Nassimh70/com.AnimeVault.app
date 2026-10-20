# 🧭 Roadmap Ingénieur IA / Data Engineer / Automatisation — Édition 2026-2028

**Profil de départ :** Licence 3 Informatique (Algérie) → Master IA, bases en ML supervisé, algo, BDD, réseaux, dev.
**Objectif final :** Ingénieur capable de livrer des projets professionnels en IA, Data Engineering, Automatisation IA, LLM/Agents, Backend, Cloud.
**Méthode :** Apprentissage par projet — chaque notion théorique est suivie d'une implémentation concrète avant de passer à la suivante.

---

## 📊 Vue d'ensemble chronologique

| Phase | Sujet | Durée estimée | Prérequis | Débouché immédiat |
|---|---|---|---|---|
| 0 | Prérequis (Git, terminal, algo, anglais tech) | 2 semaines | — | — |
| 1 | Make.com (No-Code) | 2 semaines | Phase 0 | Freelance automatisation junior |
| 2 | n8n | 3 semaines | Phase 1 | Automatisation No-Code avancée |
| 3 | APIs (HTTP/REST/Auth) | 2 semaines | Phase 2 | Intégrateur API |
| 4 | Python (ciblé IA/Data/API) | 4 semaines | Phase 3 | Développeur Python junior |
| 5 | SQL | 2 semaines | Phase 4 | Analyste de données junior |
| 6 | Pandas | 2 semaines | Phase 5 | Data Analyst junior |
| 7 | NumPy | 1 semaine | Phase 6 | — |
| 8 | Scikit-Learn (ML) | 4 semaines | Phase 7 | ML Engineer junior |
| 9 | LLM (OpenAI/Gemini/Claude, RAG) | 3 semaines | Phase 8 | AI Engineer junior |
| 10 | n8n + IA (agents, chatbots) | 3 semaines | Phase 9 | AI Automation Engineer |
| 11 | Backend (FastAPI/Flask, JWT, PostgreSQL) | 4 semaines | Phase 10 | Backend Developer junior |
| 12 | Docker | 1,5 semaine | Phase 11 | — |
| 13 | Git avancé | 1 semaine (en parallèle dès Phase 0) | — | — |
| 14 | Portfolio (40+ projets) | En continu | Toutes | Candidature stage/emploi |

**Durée totale réaliste :** environ 9 à 11 mois à raison de 10-15h/semaine, en gardant les cours de Master en parallèle (le Master couvrira une partie de la théorie ML/DL, cette roadmap comble le manque "ingénierie/production").

---

## Phase 0 — Prérequis (2 semaines)

**Pourquoi :** sans ces bases, chaque phase suivante ralentit. C'est le socle invisible mais indispensable.

**À maîtriser (obligatoire) :**
- Terminal Linux/Bash : navigation, permissions, variables d'environnement, pipes (`|`, `grep`, `find`)
- Git de base : `clone`, `commit`, `push`, `pull`, `branch`, `.gitignore`
- Structures de données fondamentales (déjà vues en Licence, à consolider) : listes, dictionnaires, arbres, complexité O(n)
- Anglais technique : lire une documentation officielle sans traduire
- VS Code : extensions, raccourcis, debugger, terminal intégré

**Optionnel :** régex avancées, WSL2 si sous Windows (fortement conseillé pour la suite).

**Erreurs à éviter :** vouloir "tout maîtriser" avant de commencer un projet — ici l'objectif est juste d'être fonctionnel, pas expert.

**Ressources gratuites :**
- *Git & GitHub* : freeCodeCamp "Git and GitHub for Beginners" (YouTube)
- *Terminal* : "Linux Command Line Basics" (freeCodeCamp)
- Doc officielle Git : git-scm.com/doc

**Niveau attendu en sortie :** capable d'installer un projet depuis GitHub et de le faire tourner seul.

**Critère de validation avant Phase 1 :** cloner un dépôt GitHub, créer une branche, faire un commit et un push sans aide.

---

## Phase 1 — Automatisation No-Code : Make.com (2 semaines)

**Pourquoi :** Make (ex-Integromat) t'apprend la *logique* de l'automatisation (triggers → filtres → actions) sans la complexité du code. C'est la meilleure porte d'entrée avant n8n et avant même les APIs — tu comprends les concepts visuellement.

**À maîtriser :**
- Scénarios, modules, triggers (webhook, polling, schedule)
- Filtres et routers (conditions logiques)
- Variables, mapping de données entre modules
- Gestion d'erreurs (error handlers)
- Connexions aux apps courantes : Gmail, Google Sheets, Slack, Notion

**Optionnel :** modules avancés (iterator, aggregator) — utiles mais à voir en 2e passage.

**Erreurs à éviter :** créer des scénarios trop complexes en un seul bloc ; toujours tester module par module ("Run once").

**Ressources gratuites :** chaîne YouTube officielle Make Academy, documentation make.com/en/help.

**Temps moyen :** 15-20h.

**Mini-projets :**
1. Auto-poster : nouveau post Google Sheet → publication automatique sur Slack
2. Veille email → extraction pièce jointe → sauvegarde Google Drive
3. Formulaire (Google Form) → ajout ligne Sheet → email de confirmation personnalisé

**Bilan de phase :**
- ✔ Compétences : logique d'automatisation, mapping de données
- ✔ Technologies : Make.com
- ✔ Niveau : Débutant en automatisation
- ✔ Peut postuler à : rien encore (phase de fondation), mais peut proposer des micro-automatisations en freelance à des petites entreprises locales

**Validation avant Phase 2 :** avoir livré les 3 mini-projets fonctionnels de bout en bout.

---

## Phase 2 — n8n (3 semaines)

**Pourquoi :** n8n est l'équivalent open-source et bien plus puissant de Make. Il est **très demandé** car il permet du code custom (JS/Python), du self-hosting, et s'intègre nativement avec les LLM — c'est l'outil que les entreprises utilisent en 2026 pour les AI Agents.

**À maîtriser :**
- Installation (Docker recommandé, on le fera aussi en Phase 12) ou n8n Cloud pour débuter
- Interface : canvas, nodes, connexions
- Nodes essentiels : HTTP Request, Set, IF, Switch, Merge, Code (JS)
- Expressions n8n (`{{ }}`) et manipulation de données JSON
- Webhooks entrants/sortants
- Credentials et gestion sécurisée des clés API
- Workflows avancés : sub-workflows, error workflows, loops (SplitInBatches)

**Optionnel pour l'instant :** self-hosting avancé avec queue mode (à revoir après Docker).

**Erreurs à éviter :** copier des workflows tout faits sans comprendre chaque node — reconstruis-les toi-même une fois pour bien assimiler.

**Ressources gratuites :** chaîne YouTube n8n officielle, "n8n Academy" (gratuit), docs.n8n.io.

**Temps moyen :** 25-30h.

**Mini-projets :**
1. Webhook qui reçoit des données et les insère dans Google Sheets
2. Scraper simple (HTTP Request + parsing) → notification Telegram
3. Automatisation multi-étapes avec gestion d'erreur (retry + notification en cas d'échec)

**Bilan de phase :**
- ✔ Compétences : logique avancée d'automatisation, JSON, webhooks
- ✔ Niveau : Intermédiaire en automatisation
- ✔ Peut postuler à : Automatisation Freelance / No-Code Developer junior

---

## Phase 3 — Les APIs (2 semaines)

**Pourquoi :** Make et n8n t'ont donné l'intuition ; maintenant tu comprends *ce qu'il se passe sous le capot*. C'est un prérequis absolu pour Python appliqué, les LLM, et le Backend.

**À maîtriser en profondeur :**
- HTTP : requêtes/réponses, codes de statut (2xx, 4xx, 5xx)
- REST : ressources, endpoints, verbes (GET, POST, PUT, PATCH, DELETE)
- JSON : structure, sérialisation/désérialisation
- Headers : Content-Type, Authorization
- Authentification : API Keys, Bearer Token, OAuth 2.0 (flow simplifié)
- Rate limiting et pagination (concepts très demandés en entretien)

**Optionnel :** GraphQL (à voir seulement si un projet spécifique le demande), WebSockets.

**Erreurs à éviter :** confondre authentification (qui es-tu) et autorisation (que peux-tu faire) — question classique en entretien.

**Ressources gratuites :** "HTTP Crash Course" (Traversy Media), doc officielle Postman Learning Center, roadmap.sh/api-design.

**Outils :** Postman ou Insomnia pour tester sans coder.

**Temps moyen :** 15h.

**Projets :**
1. Tester et documenter 3 APIs publiques différentes avec Postman (ex : OpenWeather, JSONPlaceholder, une API avec OAuth)
2. Créer un workflow n8n qui consomme une API avec Bearer Token
3. Construire une collection Postman complète avec variables d'environnement

**Bilan de phase :**
- ✔ Compétences : HTTP, REST, JSON, Auth
- ✔ Niveau : Intermédiaire
- ✔ Peut postuler à : Intégrateur API junior, No-Code + API Developer

---

## Phase 4 — Python ciblé (4 semaines)

**Pourquoi :** tu ne fais PAS du Python "généraliste". Tu apprends uniquement ce qui sert directement à l'IA, la Data et les APIs, dans l'ordre de priorité réel du marché.

**Classement du plus important au moins important :**

| Priorité | Notion | Usage concret |
|---|---|---|
| 1 | Syntaxe de base (variables, boucles, fonctions, conditions) | Base de tout |
| 2 | Structures de données (list, dict, set, tuple + compréhensions) | Manipulation de données, JSON |
| 3 | Manipulation de fichiers (JSON, CSV, TXT) | Data Engineering, logs |
| 4 | Requêtes HTTP avec `requests` | Consommer des APIs (LLM, services externes) |
| 5 | Gestion des erreurs (`try/except`) | Scripts robustes en production |
| 6 | Programmation orientée objet (classes, héritage) | Structurer des projets IA/backend |
| 7 | Fonctions avancées (`*args`, `**kwargs`, décorateurs, lambda) | Frameworks (FastAPI, Flask) |
| 8 | Environnements virtuels (`venv`, `pip`) | Gestion de dépendances |
| 9 | Async/await (bases) | APIs performantes, FastAPI |
| 10 | Type hints | Code professionnel lisible |

**Optionnel :** programmation fonctionnelle avancée, métaclasses, threading complexe — pas nécessaire à ce stade.

**Erreurs à éviter :** apprendre Python "en général" via un cours de 40h généraliste — cible directement les notions du tableau, tu gagneras 2-3 semaines.

**Ressources gratuites :** "Python for Everybody" (Dr. Chuck, gratuit sur YouTube/Coursera en audit), doc officielle docs.python.org, Corey Schafer (YouTube) pour OOP.

**Temps moyen :** 35-40h.

**Projets :**
1. Script qui consomme une API météo et exporte les données en CSV
2. Petit framework personnel de gestion d'erreurs pour scripts d'automatisation
3. Mini-CLI (interface en ligne de commande) qui interagit avec un webhook n8n

**Bilan de phase :**
- ✔ Compétences : Python appliqué, OOP, consommation d'API
- ✔ Niveau : Junior Developer
- ✔ Peut postuler à : Python Developer junior, Automation Engineer

---

## Phase 5 — SQL (2 semaines)

**Pourquoi :** tout Data Engineer doit maîtriser SQL avant même Pandas — c'est la base de données qui structure la donnée en amont.

**À maîtriser :**
- SELECT, WHERE, ORDER BY, LIMIT
- Agrégations : GROUP BY, HAVING, COUNT, SUM, AVG
- Jointures : INNER, LEFT, RIGHT, FULL
- Sous-requêtes et CTE (`WITH`)
- Fenêtrage : `ROW_NUMBER()`, `RANK()`, `PARTITION BY` (très demandé en entretien Data)
- Index et bases de la performance de requêtes
- Modélisation : clés primaires/étrangères, normalisation (bases)

**Optionnel :** procédures stockées, triggers SQL — utile seulement en poste DBA.

**Erreurs à éviter :** apprendre SQL uniquement en théorie — pratique sur un vrai jeu de données (ex : Northwind, Chinook).

**Ressources gratuites :** SQLBolt (interactif), Mode Analytics SQL Tutorial, PostgreSQL Exercises (pgexercises.com).

**Temps moyen :** 15h.

**Projets :**
1. Requêtes d'analyse sur la base Chinook (ventes, clients, top produits)
2. Recréer un mini dashboard de stats via requêtes SQL pures
3. Modéliser et créer une base de données pour un projet personnel (ex : tracker d'animes 😉)

**Bilan de phase :**
- ✔ Niveau : Junior Data Analyst
- ✔ Peut postuler à : Data Analyst junior, Junior Data Engineer

---

## Phase 6 — Pandas (2 semaines)

**Pourquoi :** Pandas est l'outil numéro 1 pour manipuler de la donnée en Python, pont direct entre SQL et le Machine Learning.

**À maîtriser :**
- Chargement de données (CSV, JSON, SQL) avec `read_csv`, `read_sql`
- Nettoyage : valeurs manquantes (`fillna`, `dropna`), doublons, types
- Sélection et filtrage : `loc`, `iloc`, masques booléens
- Transformation : `apply`, `map`, `groupby`
- Jointures : `merge`, `concat`
- Statistiques descriptives : `describe`, `value_counts`, corrélations

**Optionnel :** MultiIndex, pivot tables avancés — à voir si un projet le nécessite.

**Erreurs à éviter :** utiliser des boucles `for` sur un DataFrame — toujours privilégier les opérations vectorisées.

**Ressources gratuites :** Kaggle Learn "Pandas" (gratuit, interactif), doc officielle pandas.pydata.org.

**Temps moyen :** 15h.

**Projets :**
1. Nettoyage complet d'un dataset Kaggle brut (valeurs manquantes, doublons, types)
2. Analyse exploratoire d'un dataset de ton choix avec export de statistiques
3. Pipeline de nettoyage réutilisable (fonction Python appelable sur n'importe quel CSV)

**Bilan de phase :**
- ✔ Niveau : Data Analyst confirmé (junior)
- ✔ Peut postuler à : Data Analyst, Junior Data Engineer

---

## Phase 7 — NumPy (1 semaine)

**Pourquoi :** NumPy est le socle mathématique sous-jacent à Pandas et Scikit-Learn — tu n'as pas besoin d'être expert, juste de comprendre les tableaux (arrays) et leur logique vectorielle.

**Notions réellement importantes :**
- Création et manipulation d'arrays (`np.array`, `reshape`, `arange`)
- Opérations vectorisées (plus rapides que les boucles Python)
- Broadcasting (comprendre le concept, pas le maîtriser à 100%)
- Indexation et slicing multi-dimensionnel
- Fonctions statistiques de base (`mean`, `std`, `sum` par axe)

**Ce qui est optionnel :** algèbre linéaire avancée (produits matriciels complexes) — utile seulement si tu vas vers la recherche en Deep Learning.

**Ressources gratuites :** NumPy Quickstart (doc officielle), Kaggle Learn.

**Temps moyen :** 6-8h.

**Bilan de phase :** pas de projet dédié — NumPy sera directement réinvesti en Phase 8.

---

## Phase 8 — Scikit-Learn / Machine Learning (4 semaines)

**Pourquoi :** c'est ici que ta théorie de Licence (ML supervisé) devient concrète et déployable.

**Comment passer de la théorie à la pratique :**
Pour chaque algorithme vu en cours, refais-le en pratique sur un vrai dataset avant de passer au suivant — ne saute jamais cette étape, sinon la théorie reste abstraite.

**Algorithmes à apprendre (dans l'ordre) :**
1. Régression linéaire / logistique
2. K-Nearest Neighbors (KNN)
3. Arbres de décision
4. Random Forest
5. Gradient Boosting (XGBoost/LightGBM — très demandés en entreprise)
6. SVM (bases, moins prioritaire aujourd'hui)
7. K-Means (clustering, non supervisé)
8. PCA (réduction de dimension)

**Compétences transverses à maîtriser :**
- Pipeline Scikit-Learn (`Pipeline`, `ColumnTransformer`)
- Preprocessing : `StandardScaler`, `OneHotEncoder`
- Validation : `train_test_split`, cross-validation
- Métriques : accuracy, precision/recall, F1, RMSE, matrice de confusion
- Overfitting/underfitting, régularisation (concepts, pas juste formules)

**Optionnel :** hyperparameter tuning avancé (GridSearch suffit au début, Optuna plus tard).

**Erreurs à éviter :** évaluer un modèle uniquement sur l'accuracy — comprends quand utiliser precision/recall (ex : détection de fraude).

**Ressources gratuites :** Kaggle Learn "Intro to Machine Learning" + "Intermediate ML", StatQuest (YouTube, excellent pour l'intuition), doc scikit-learn.org.

**Temps moyen :** 35-40h.

**Projets :**
1. Prédiction de prix (régression) sur un dataset immobilier
2. Classification (churn client ou détection de spam) avec pipeline complet
3. Clustering de clients (segmentation) avec K-Means + visualisation
4. Compétition Kaggle débutant (Titanic ou équivalent) avec pipeline de A à Z

**Bilan de phase :**
- ✔ Compétences : ML supervisé/non supervisé de bout en bout
- ✔ Niveau : ML Engineer junior
- ✔ Peut postuler à : ML Engineer junior, Data Scientist junior

---

## Phase 9 — LLM : OpenAI, Gemini, Claude (3 semaines)

**Pourquoi :** c'est la compétence la plus demandée en 2026 pour un profil "IA appliquée" — savoir intégrer un LLM dans un vrai produit, pas juste discuter avec ChatGPT.

**À maîtriser :**
- Appels API : structure des messages (`system`, `user`, `assistant`), paramètres (`temperature`, `max_tokens`)
- Prompt engineering structuré : few-shot, chain-of-thought, formats de sortie contraints (JSON)
- Function calling / tool use (très demandé — connecter un LLM à des actions réelles)
- Embeddings : comprendre ce qu'ils représentent, similarité cosinus
- RAG (Retrieval-Augmented Generation) : chunking, vector store (ex : Chroma, Pinecone en version gratuite), pipeline retrieval → génération
- Différences pratiques entre OpenAI, Gemini et Claude (contexte, tarifs, function calling)

**Optionnel pour l'instant :** fine-tuning de modèles (coûteux, rarement nécessaire en 2026 face au RAG + prompting).

**Erreurs à éviter :** croire que le RAG est "juste un vector store" — la qualité du chunking et du prompt final compte souvent plus que le modèle d'embedding choisi.

**Ressources gratuites :** documentation officielle OpenAI/Anthropic/Google AI, DeepLearning.AI courses gratuits ("ChatGPT Prompt Engineering for Developers", "Building RAG Applications").

**Temps moyen :** 25h.

**Projets :**
1. Assistant CLI qui répond en JSON structuré à partir d'un prompt système strict
2. Système RAG simple sur tes propres documents (ex : tes cours de sécurité réseau)
3. Agent avec function calling qui interroge une API externe (météo, base de données)

**Bilan de phase :**
- ✔ Niveau : AI Engineer junior
- ✔ Peut postuler à : AI Engineer junior, LLM Application Developer

---

## Phase 10 — n8n + IA : Agents et Automatisation intelligente (3 semaines)

**Pourquoi :** c'est ici que tout converge — No-Code + APIs + Python + LLM. C'est un des profils les plus recherchés et les mieux payés en freelance en 2026.

**À construire :**
- AI Agents dans n8n (node AI Agent, mémoire conversationnelle, outils connectés)
- Chatbots connectés à Telegram/Discord/WhatsApp
- OCR automatisé (extraction de texte depuis PDF/images → traitement LLM)
- Traitement de PDF (résumé automatique, extraction de données structurées)
- Automatisations Gmail (tri, réponse automatique, extraction d'infos)
- Intégrations Notion / Google Drive (base de connaissances automatisée)

**Erreurs à éviter :** construire un agent sans limite de boucle/coût — toujours prévoir un plafond d'itérations et un monitoring des tokens.

**Ressources gratuites :** n8n YouTube (playlist "AI Agents"), n8n community templates (gratuits, à étudier puis reconstruire soi-même).

**Temps moyen :** 25h.

**Projets :**
1. Chatbot Telegram connecté à un LLM avec mémoire de conversation
2. Pipeline OCR + résumé automatique de factures/PDF vers Google Sheets
3. Agent Gmail qui trie, résume et répond aux emails simples automatiquement
4. Assistant Notion qui organise automatiquement une base de connaissances

**Bilan de phase :**
- ✔ Niveau : AI Automation Engineer confirmé
- ✔ Peut postuler à : AI Automation Engineer, freelance haut de gamme (souvent le plus rentable pour un junior en 2026)

---

## Phase 11 — Backend (4 semaines)

**Pourquoi :** pour transformer tes automatisations et modèles IA en vrais produits accessibles via une API, tu dois savoir construire un backend.

**À maîtriser :**
- FastAPI (prioritaire — async natif, très utilisé pour servir des modèles IA) : routes, Pydantic (validation), documentation auto (Swagger)
- Flask (bases seulement — pour comprendre les différences et lire du code legacy)
- Authentification : JWT (génération, vérification, refresh tokens)
- CRUD complet (Create, Read, Update, Delete) relié à une base de données
- PostgreSQL : connexion depuis Python (SQLAlchemy ou requêtes directes), migrations de base

**Optionnel :** WebSockets pour du temps réel — utile seulement si un projet le demande (ex : chat en direct).

**Erreurs à éviter :** stocker des mots de passe en clair — toujours hasher (bcrypt) ; ne jamais exposer de clé secrète dans le code (utiliser `.env`).

**Ressources gratuites :** FastAPI doc officielle (excellente et gratuite), "FastAPI Course" (freeCodeCamp YouTube), "SQLAlchemy ORM Tutorial".

**Temps moyen :** 35-40h.

**Projets :**
1. API CRUD complète avec authentification JWT (ex : backend d'AnimeVault que tu as déjà commencé — parfait pour appliquer)
2. API qui expose un modèle Scikit-Learn (prédiction via endpoint POST)
3. API qui orchestre un appel LLM avec RAG et retourne une réponse structurée

**Bilan de phase :**
- ✔ Niveau : Backend Developer junior / AI Engineer
- ✔ Peut postuler à : Backend Developer, AI Engineer (API/Backend), Full-Stack junior

---

## Phase 12 — Docker (1,5 semaine)

**Pourquoi :** uniquement pour héberger et déployer tes projets IA/backend de façon reproductible — pas besoin de maîtriser Kubernetes à ce stade.

**À maîtriser :**
- Concepts : image vs container, Dockerfile, `docker-compose`
- Dockeriser une API FastAPI + une base PostgreSQL avec `docker-compose`
- Variables d'environnement en Docker (`.env`)
- Volumes (persistance de données)
- Déploiement simple sur un service gratuit/pas cher (Render, Railway, Fly.io)

**Optionnel :** orchestration multi-container avancée, Kubernetes — à voir seulement en poste DevOps/MLOps.

**Erreurs à éviter :** builder des images trop lourdes — utiliser des images de base `slim` ou `alpine`.

**Ressources gratuites :** "Docker Tutorial for Beginners" (TechWorld with Nana, YouTube), docs.docker.com.

**Temps moyen :** 10-12h.

**Projet :** dockeriser complètement ton backend AnimeVault (API + DB) avec `docker-compose up` fonctionnel en une commande.

---

## Phase 13 — Git avancé (1 semaine, en parallèle dès Phase 0)

**Pourquoi :** au-delà des bases, un ingénieur doit savoir collaborer proprement.

**À maîtriser :**
- Branches et stratégies (Git Flow simplifié : `main`, `dev`, `feature/*`)
- Résolution de conflits
- `rebase` vs `merge` (comprendre la différence)
- Pull Requests et code review (pratique même en solo, sur GitHub)
- README professionnel, `.gitignore` adapté par projet

**Ressources gratuites :** "Git Branching" (learngitbranching.js.org — interactif et excellent).

**Temps moyen :** 8h, réparti tout au long de la roadmap.

---

## Phase 14 — Portfolio : 40+ idées de projets

### 🟢 Débutant (Phases 0-4)
1. Script Python d'automatisation de renommage de fichiers
2. Convertisseur CSV → JSON en ligne de commande
3. Bot Telegram simple (echo bot)
4. Scénario Make : veille RSS → résumé email
5. Workflow n8n : formulaire → Google Sheet → notification Slack
6. Client API météo en Python avec export CSV
7. Mini scraper (BeautifulSoup) de prix produits
8. Générateur de rapport PDF simple à partir de données CSV
9. To-Do List CLI avec sauvegarde JSON
10. Dashboard Google Sheets automatisé via Make

### 🟡 Intermédiaire (Phases 5-8)
11. Pipeline de nettoyage de données réutilisable (Pandas)
12. Dashboard d'analyse de ventes (SQL + Pandas + visualisation)
13. Système de recommandation simple (similarité cosinus) — *ex : recommandation d'animes, tu as déjà la base de données !*
14. Modèle de prédiction de prix immobiliers avec pipeline Scikit-Learn complet
15. Détecteur de spam/sentiment (classification NLP simple avec Scikit-Learn)
16. Segmentation clients par clustering (K-Means) + rapport
17. API météo enrichie avec base de données PostgreSQL
18. Automatisation n8n avec OCR de factures → Google Sheets
19. Pipeline ETL complet (extraction API → nettoyage Pandas → stockage SQL)
20. Bot Discord modérateur avec commandes personnalisées

### 🟠 Avancé (Phases 9-11)
21. Assistant IA avec RAG sur tes cours personnels (PDF de sécurité réseau, deep learning)
22. Chatbot LLM avec mémoire conversationnelle et function calling
23. API FastAPI qui sert un modèle ML en production avec authentification
24. Agent n8n qui gère automatiquement une boîte Gmail (tri, résumé, réponse)
25. Système de veille automatisé : scraping → LLM (résumé) → publication Notion
26. Plateforme complète (comme AnimeVault) avec backend FastAPI + JWT + PostgreSQL + frontend React
27. Générateur de contenu automatisé (LLM + n8n + publication multi-plateforme)
28. Outil d'analyse de CV automatique (extraction PDF + scoring LLM structuré)
29. API de classification d'images simple (transfer learning avec un modèle pré-entraîné)
30. Dashboard temps réel (FastAPI + WebSocket + frontend) pour monitoring de données

### 🔴 Expert (Post-roadmap, dockerisé + déployé)
31. Micro-SaaS complet : automatisation IA vendue en marque blanche à des PME (n8n + LLM + Stripe)
32. Plateforme multi-agents IA orchestrés (agents spécialisés qui collaborent via n8n/LangGraph)
33. Pipeline MLOps complet : entraînement, versioning (MLflow), déploiement Docker, monitoring
34. Système RAG avancé multi-sources avec réévaluation (re-ranking) des résultats
35. API de recommandation à grande échelle avec cache et base vectorielle (Pinecone/Weaviate)
36. Data pipeline complet type "Data Engineer" : ingestion → transformation → orchestration (Airflow) → visualisation
37. Assistant vocal IA connecté à des automatisations n8n (speech-to-text + LLM + actions)
38. Système de détection de fraude en temps réel (ML + API + alerting automatisé)
39. Plateforme de gestion de projet IA-augmentée (type Notion + agents intégrés)
40. Ton propre framework/outil open-source publié sur GitHub, avec documentation et tests, résolvant un vrai problème d'automatisation IA

**Conseil :** ne fais pas les 40 — choisis-en 8 à 10 bien exécutés, documentés, déployés et présentés (README + démo vidéo) plutôt que 40 projets à moitié finis. La qualité prime sur la quantité pour un portfolio.

---

## ⚠️ Pièges à éviter (globalement)

1. **Le piège du tutoriel infini** : suivre des cours sans jamais construire par toi-même. Règle : pour chaque heure de cours, deux heures de pratique minimum.
2. **Le piège de la dispersion** : vouloir apprendre 5 technologies en parallèle. Suis l'ordre de la roadmap — chaque phase prépare vraiment la suivante.
3. **Le piège du perfectionnisme** : ne jamais publier un projet "parce qu'il n'est pas parfait". Un projet fonctionnel et documenté vaut mieux qu'un projet parfait jamais terminé.
4. **Le piège de la théorie pure en ML** : refaire les formules sans jamais les coder sur un vrai dataset — la théorie de Licence/Master doit systématiquement être suivie d'une implémentation.
5. **Le piège du "je code sans versionner"** : chaque projet, dès le premier jour, doit être sur Git/GitHub.
6. **Le piège de l'outil à la mode** : ne saute pas sur chaque nouvel outil IA qui sort chaque semaine — reste concentré sur les fondamentaux qui ne changent pas (HTTP, SQL, Python, ML de base) ; les outils passent, les fondamentaux restent.
7. **Le piège de l'isolement** : ne pas partager son travail. Publie sur GitHub, LinkedIn, ou des communautés (Reddit r/n8n, Discord n8n/OpenAI) — le feedback accélère énormément la progression.

---

## 💬 Conseils d'un mentor

- **Documente tout dès le premier projet.** Un bon README (contexte, install, démo) vaut souvent plus qu'une fonctionnalité en plus.
- **Choisis un projet "signature"** dès la Phase 6-7 (par exemple ton projet AnimeVault) et fais-le évoluer à travers toute la roadmap : ajoute du SQL en Phase 5, un pipeline de recommandation en Phase 8, un chatbot LLM en Phase 9, une API sécurisée en Phase 11, un déploiement Docker en Phase 12. Un projet qui évolue avec toi est bien plus impressionnant en entretien qu'une collection de projets déconnectés.
- **Vise la Tunisie/Europe/Canada dès maintenant** : rédige tes README et commentaires de code en anglais dès la Phase 4 — c'est un standard international et ça prépare directement à la recherche d'emploi/stage à l'étranger.
- **Le marché 2026-2028** valorise particulièrement le triptyque **Automatisation No-Code + LLM + Backend** — c'est rare de trouver quelqu'un qui maîtrise les trois en même temps, et c'est exactement ce vers quoi cette roadmap te mène.
- **Ne néglige pas le soft-skill "expliquer ce que tu as construit"** : prépare-toi à présenter chaque projet en 2 minutes (problème → solution → résultat) — c'est ce qu'on te demandera en entretien.
- **Révise cette roadmap tous les 2-3 mois** : le marché IA évolue vite, certains outils (nouveaux frameworks agentiques, nouvelles versions de LLM) apparaîtront — garde les fondamentaux (HTTP, SQL, Python, ML, Backend) comme socle stable et adapte la couche "outils" au besoin.

---

*Bon courage Nassim — tu as déjà un excellent point de départ avec ton projet AnimeVault : c'est exactement le type de projet évolutif à faire grandir phase après phase.*
