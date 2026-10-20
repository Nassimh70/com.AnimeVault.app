const { toIso } = require('../utils/dates');

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toApiAnime(row, relations = {}) {
  return {
    id: row.id,
    title: row.title,
    titleJapanese: row.title_japanese || '',
    image: row.image || '',
    synopsis: row.synopsis || '',
    genres: relations.genres || [],
    studios: relations.studios || [],
    author: row.author || '',
    episodesTotal: numberOrZero(row.episodes_total),
    episodesWatched: numberOrZero(row.episodes_watched),
    episodeDuration: numberOrZero(row.episode_duration) || 24,
    releaseDate: row.release_date || '',
    season: row.season || '',
    status: row.status,
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    comment: row.comment || '',
    priority: row.priority,
    platform: row.platform || '',
    language: row.language,
    malLink: row.mal_link || '',
    aniListLink: row.anilist_link || '',
    isFavorite: Boolean(row.is_favorite),
    tags: relations.tags || [],
    collections: relations.collections || [],
    dateAdded: toIso(row.date_added),
    dateFinished: toIso(row.date_finished),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function toApiHistory(row) {
  return {
    id: row.id,
    animeId: row.anime_id || null,
    animeTitle: row.anime_title,
    action: row.action,
    details: row.details || '',
    createdAt: toIso(row.created_at),
  };
}

module.exports = { toApiAnime, toApiHistory, numberOrZero };
