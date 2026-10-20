/**
 * Point d'entrée du serveur AnimeVault API.
 * Initialise la base SQLite (créée automatiquement si absente), puis lance Express.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const animeRoutes = require('./routes/animeRoutes');
const statsRoutes = require('./routes/statsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const jikanRoutes = require('./routes/jikanRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 1. Initialiser la base de données (création auto des tables si besoin)
initDatabase();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'AnimeVault API opérationnelle' }));

app.use('/api/animes', animeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/jikan', jikanRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => res.status(404).json({ success: false, error: 'Route introuvable.' }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AnimeVault API démarrée sur http://localhost:${PORT}`);
});
