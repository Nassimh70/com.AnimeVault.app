const AnimeModel = require('../models/animeModel');

function toCSV(animes) {
  if (animes.length === 0) return '';
  const headers = Object.keys(animes[0]).filter((k) => !['genres','studios','tags','collections'].includes(k))
    .concat(['genres', 'studios', 'tags', 'collections']);

  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const s = Array.isArray(val) ? val.join('|') : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = animes.map((a) => headers.map((h) => escape(a[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

const ExportController = {
  exportJSON(req, res) {
    const animes = AnimeModel.getAll();
    res.setHeader('Content-Disposition', 'attachment; filename="animevault-export.json"');
    res.json({ exportedAt: new Date().toISOString(), count: animes.length, animes });
  },

  exportCSV(req, res) {
    const animes = AnimeModel.getAll();
    const csv = toCSV(animes);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="animevault-export.csv"');
    res.send(csv);
  },

  importJSON(req, res) {
    const { animes } = req.body;
    if (!Array.isArray(animes)) {
      return res.status(400).json({ success: false, error: 'Format invalide : "animes" doit être un tableau.' });
    }
    let imported = 0;
    animes.forEach((a) => {
      try {
        AnimeModel.create(a);
        imported += 1;
      } catch (e) {
        console.error('Import échoué pour un anime:', e.message);
      }
    });
    res.json({ success: true, imported, total: animes.length });
  },
};

module.exports = ExportController;
