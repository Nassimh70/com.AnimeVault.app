const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const { env } = require('./config/env');
const { requestId } = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');
const { AppError } = require('./utils/errors');

const animeRoutes = require('./routes/animeRoutes');
const statsRoutes = require('./routes/statsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const jikanRoutes = require('./routes/jikanRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const HealthController = require('./controllers/healthController');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', false);
app.use(requestId);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed =
        env.corsOrigin.includes(origin) ||
        (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):5173$/.test(origin));
      return callback(null, allowed);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'Content-Disposition'],
    maxAge: 86400,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/api/health', HealthController.check);

app.use('/uploads', express.static(env.uploadsDir, { maxAge: '7d', index: false, fallthrough: true }));

app.use('/api', apiLimiter);
app.use('/api/animes', animeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/jikan', jikanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable.' });
});

app.use(errorHandler);

module.exports = app;
