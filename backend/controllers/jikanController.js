const jikanService = require('../services/jikanService');

const JikanController = {
  async search(req, res) {
    const data = await jikanService.search(req.query.q);
    res.json({ success: true, data, count: data.length });
  },
};

module.exports = JikanController;
