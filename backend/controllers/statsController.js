const AnimeModel = require('../models/animeModel');
const HistoryModel = require('../models/historyModel');

const StatsController = {
  getStats(req, res) {
    const animes = AnimeModel.getAll();

    const total = animes.length;
    const termine = animes.filter((a) => a.status === 'termine').length;
    const enCours = animes.filter((a) => a.status === 'en_cours').length;
    const aVoir = animes.filter((a) => a.status === 'a_voir').length;
    const pause = animes.filter((a) => a.status === 'pause').length;
    const abandonne = animes.filter((a) => a.status === 'abandonne').length;

    const totalEpisodesWatched = animes.reduce((sum, a) => sum + (a.episodesWatched || 0), 0);
    const totalMinutesWatched = animes.reduce(
      (sum, a) => sum + (a.episodesWatched || 0) * (a.episodeDuration || 24),
      0
    );

    const remainingEpisodes = animes.reduce((sum, a) => {
      const remaining = Math.max((a.episodesTotal || 0) - (a.episodesWatched || 0), 0);
      return sum + remaining;
    }, 0);
    const remainingMinutes = animes.reduce((sum, a) => {
      const remaining = Math.max((a.episodesTotal || 0) - (a.episodesWatched || 0), 0);
      return sum + remaining * (a.episodeDuration || 24);
    }, 0);

    const genreCount = {};
    const studioCount = {};
    animes.forEach((a) => {
      (a.genres || []).forEach((g) => (genreCount[g] = (genreCount[g] || 0) + 1));
      (a.studios || []).forEach((s) => (studioCount[s] = (studioCount[s] || 0) + 1));
    });

    const ratingDistribution = Array.from({ length: 11 }, (_, i) => ({
      rating: i,
      count: animes.filter((a) => Math.round(a.rating || 0) === i && a.rating !== null).length,
    }));

    const lastAdded = [...animes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    res.json({
      success: true,
      data: {
        total,
        termine,
        enCours,
        aVoir,
        pause,
        abandonne,
        totalEpisodesWatched,
        totalMinutesWatched,
        totalHoursWatched: Math.round(totalMinutesWatched / 60),
        remainingEpisodes,
        remainingMinutes,
        remainingHours: Math.round(remainingMinutes / 60),
        favoriteCount: animes.filter((a) => a.isFavorite).length,
        genreDistribution: Object.entries(genreCount).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value),
        studioDistribution: Object.entries(studioCount).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value),
        ratingDistribution,
        lastAdded: lastAdded || null,
      },
    });
  },

  getHistory(req, res) {
    res.json({ success: true, data: HistoryModel.getAll(200) });
  },
};

module.exports = StatsController;
