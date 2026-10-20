const animeService = require('../services/animeService');
const { AppError } = require('../utils/errors');

const AnimeController = {
  async list(req, res) {
    const result = await animeService.listAnimes(req.query);
    res.json({ success: true, ...result });
  },

  async getMeta(req, res) {
    const data = await animeService.getMeta();
    res.json({ success: true, data });
  },

  async getOne(req, res) {
    const data = await animeService.getById(req.params.id);
    res.json({ success: true, data });
  },

  async create(req, res) {
    const data = await animeService.createAnime(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    const data = await animeService.updateAnime(req.params.id, req.body);
    res.json({ success: true, data });
  },

  async updateProgress(req, res) {
    const data = await animeService.updateProgress(req.params.id, req.body);
    res.json({ success: true, data });
  },

  async favorite(req, res) {
    const data = await animeService.toggleFavorite(req.params.id, req.body.isFavorite);
    res.json({ success: true, data });
  },

  async remove(req, res) {
    const data = await animeService.removeAnime(req.params.id);
    res.json({ success: true, data, message: 'Anime supprimé.' });
  },

  async removeAll(req, res) {
    if (req.query.confirm !== 'DELETE_ALL') {
      throw new AppError(400, 'Confirmation requise : ajoute ?confirm=DELETE_ALL pour tout supprimer.');
    }
    const data = await animeService.removeAllAnimes();
    res.json({ success: true, data, message: 'Bibliothèque vidée.' });
  },

  async history(req, res) {
    const data = await animeService.getAnimeHistory(req.params.id, req.query.limit);
    res.json({ success: true, data });
  },
};

module.exports = AnimeController;
