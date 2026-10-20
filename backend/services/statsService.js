const statsModel = require('../models/statsModel');
const historyModel = require('../models/historyModel');
const animeModel = require('../models/animeModel');
const { toApiAnime, toApiHistory } = require('../mappers/animeMapper');

function monthKeys(count = 12) {
  const keys = [];
  const now = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

async function getStats() {
  const [counts, genres, studios, ratings, lastAddedId, activity] = await Promise.all([
    statsModel.globalCounts(),
    statsModel.genreDistribution(),
    statsModel.studioDistribution(),
    statsModel.ratingDistribution(),
    statsModel.lastAddedId(),
    historyModel.monthlyActivity(),
  ]);

  const totalMinutesWatched = counts.totalMinutesWatched || 0;
  const remainingMinutes = counts.remainingMinutes || 0;

  const ratingMap = new Map(ratings.map((entry) => [entry.rating, entry.count]));
  const ratingDistribution = Array.from({ length: 11 }, (_, rating) => ({
    rating,
    count: ratingMap.get(rating) || 0,
  }));

  const activityMap = new Map(activity.map((entry) => [entry.month, entry.count]));
  const monthlyActivity = monthKeys(12).map((month) => ({ month, count: activityMap.get(month) || 0 }));

  let lastAdded = null;
  if (lastAddedId) {
    const row = await animeModel.findById(lastAddedId);
    if (row) {
      const relations = await animeModel.getRelationsForIds([row.id]);
      lastAdded = toApiAnime(row, relations.get(row.id));
    }
  }

  return {
    total: counts.total,
    termine: counts.termine,
    enCours: counts.enCours,
    aVoir: counts.aVoir,
    pause: counts.pause,
    abandonne: counts.abandonne,
    totalEpisodesWatched: counts.totalEpisodesWatched,
    totalMinutesWatched,
    totalHoursWatched: Math.round(totalMinutesWatched / 60),
    remainingEpisodes: counts.remainingEpisodes,
    remainingMinutes,
    remainingHours: Math.round(remainingMinutes / 60),
    favoriteCount: counts.favoriteCount,
    genreDistribution: genres,
    studioDistribution: studios,
    ratingDistribution,
    lastAdded,
    monthlyActivity,
  };
}

async function getHistory({ limit, animeId }) {
  const entries = await historyModel.list({ limit, animeId });
  return entries.map(toApiHistory);
}

async function clearHistory() {
  const deleted = await historyModel.removeAll();
  return { deleted };
}

module.exports = { getStats, getHistory, clearHistory };
