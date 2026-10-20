const database = require('../config/database');

const HealthController = {
  async check(req, res) {
    try {
      await database.ping();
      res.json({
        success: true,
        status: 'AnimeVault API opérationnelle',
        database: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        success: false,
        status: 'degraded',
        database: 'unavailable',
        error: 'Base de données indisponible.',
      });
    }
  },
};

module.exports = HealthController;
