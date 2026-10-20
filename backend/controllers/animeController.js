const AnimeModel = require('../models/animeModel');
const HistoryModel = require('../models/historyModel');

const AnimeController = {
  list(req, res) {
    let animes = AnimeModel.getAll();
    const { search, status, priority, genre, studio, platform, year, favorite, sortBy, order } = req.query;

    if (search) {
      const q = search.toLowerCase();
      animes = animes.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        (a.titleJapanese || '').toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q)) ||
        a.studios.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (status) animes = animes.filter((a) => a.status === status);
    if (priority) animes = animes.filter((a) => a.priority === priority);
    if (genre) animes = animes.filter((a) => a.genres.includes(genre));
    if (studio) animes = animes.filter((a) => a.studios.includes(studio));
    if (platform) animes = animes.filter((a) => a.platform === platform);
    if (year) animes = animes.filter((a) => (a.releaseDate || '').startsWith(String(year)));
    if (favorite === 'true') animes = animes.filter((a) => a.isFavorite);

    if (sortBy) {
      const dir = order === 'asc' ? 1 : -1;
      animes.sort((a, b) => {
        let va = a[sortBy];
        let vb = b[sortBy];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }

    res.json({ success: true, count: animes.length, data: animes });
  },

  getOne(req, res) {
    const anime = AnimeModel.getById(req.params.id);
    if (!anime) return res.status(404).json({ success: false, error: 'Anime introuvable.' });
    res.json({ success: true, data: anime });
  },

  create(req, res) {
    const anime = AnimeModel.create(req.body);
    HistoryModel.add(anime.id, anime.title, 'ajout', 'Anime ajouté à la bibliothèque');
    res.status(201).json({ success: true, data: anime });
  },

  update(req, res) {
    const before = AnimeModel.getById(req.params.id);
    if (!before) return res.status(404).json({ success: false, error: 'Anime introuvable.' });

    const anime = AnimeModel.update(req.params.id, req.body);

    if (req.body.status === 'termine' && before.status !== 'termine') {
      HistoryModel.add(anime.id, anime.title, 'termine', 'Anime marqué comme terminé');
      if (!anime.dateFinished) {
        AnimeModel.update(anime.id, { dateFinished: new Date().toISOString() });
      }
    } else {
      HistoryModel.add(anime.id, anime.title, 'modification', 'Fiche mise à jour');
    }

    res.json({ success: true, data: AnimeModel.getById(req.params.id) });
  },

  updateProgress(req, res) {
    const anime = AnimeModel.getById(req.params.id);
    if (!anime) return res.status(404).json({ success: false, error: 'Anime introuvable.' });

    const { direction } = req.body; // 'increment' | 'decrement'
    let watched = anime.episodesWatched;
    if (direction === 'increment') watched = Math.min(watched + 1, anime.episodesTotal || watched + 1);
    if (direction === 'decrement') watched = Math.max(watched - 1, 0);

    const status = anime.episodesTotal && watched >= anime.episodesTotal ? 'termine' : anime.status;
    const updated = AnimeModel.update(req.params.id, {
      episodesWatched: watched,
      status,
      dateFinished: status === 'termine' ? new Date().toISOString() : anime.dateFinished,
    });
    HistoryModel.add(anime.id, anime.title, 'progression', `Épisode ${watched}/${anime.episodesTotal || '?'}`);
    res.json({ success: true, data: updated });
  },

  remove(req, res) {
    const anime = AnimeModel.getById(req.params.id);
    if (!anime) return res.status(404).json({ success: false, error: 'Anime introuvable.' });
    AnimeModel.delete(req.params.id);
    HistoryModel.add(req.params.id, anime.title, 'suppression', 'Anime supprimé de la bibliothèque');
    res.json({ success: true, message: 'Anime supprimé.' });
  },
};

module.exports = AnimeController;
