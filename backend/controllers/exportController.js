const exportService = require('../services/exportService');

const ExportController = {
  async exportJSON(req, res) {
    const payload = await exportService.exportJson();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="animevault-export.json"');
    res.send(JSON.stringify(payload, null, 2));
  },

  async exportCSV(req, res) {
    const csv = await exportService.exportCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="animevault-export.csv"');
    res.send(csv);
  },

  async importJSON(req, res) {
    const result = await exportService.importAnimes(req.body.animes);
    res.json({ success: true, ...result });
  },
};

module.exports = ExportController;
