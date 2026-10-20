const statsService = require('../services/statsService');
const { AppError } = require('../utils/errors');

const StatsController = {
  async getStats(req, res) {
    const data = await statsService.getStats();
    res.json({ success: true, data });
  },

  async getHistory(req, res) {
    const data = await statsService.getHistory(req.query);
    res.json({ success: true, data });
  },

  async clearHistory(req, res) {
    if (req.query.confirm !== 'CLEAR_HISTORY') {
      throw new AppError(400, 'Confirmation requise : ajoute ?confirm=CLEAR_HISTORY pour vider l’historique.');
    }
    const data = await statsService.clearHistory();
    res.json({ success: true, data, message: 'Historique vidé.' });
  },
};

module.exports = StatsController;
