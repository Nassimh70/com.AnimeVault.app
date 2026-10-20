/**
 * Modèle Anime — toute la logique d'accès aux données SQLite pour les animes.
 * Aucune requête SQL brute ne doit se trouver en dehors de ce fichier (couche MVC).
 */
const { getState, writeState } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function cloneAnime(anime) {
  if (!anime) return anime;
  return {
    ...anime,
    genres: Array.isArray(anime.genres) ? [...anime.genres] : [],
    studios: Array.isArray(anime.studios) ? [...anime.studios] : [],
    tags: Array.isArray(anime.tags) ? [...anime.tags] : [],
    collections: Array.isArray(anime.collections) ? [...anime.collections] : [],
    isFavorite: !!anime.isFavorite,
  };
}

function normalizeAnime(data) {
  return cloneAnime({
    id: data.id || uuidv4(),
    title: data.title,
    titleJapanese: data.titleJapanese || '',
    image: data.image || '',
    synopsis: data.synopsis || '',
    genres: data.genres || [],
    studios: data.studios || [],
    author: data.author || '',
    episodesTotal: Number(data.episodesTotal || 0),
    episodesWatched: Number(data.episodesWatched || 0),
    episodeDuration: Number(data.episodeDuration || 24),
    releaseDate: data.releaseDate || '',
    season: data.season || '',
    status: data.status || 'a_voir',
    rating: data.rating ?? null,
    comment: data.comment || '',
    priority: data.priority || 'moyenne',
    platform: data.platform || '',
    language: data.language || 'VOSTFR',
    malLink: data.malLink || '',
    aniListLink: data.aniListLink || '',
    isFavorite: data.isFavorite ? 1 : 0,
    tags: data.tags || [],
    collections: data.collections || [],
    dateAdded: data.dateAdded || new Date().toISOString(),
    dateFinished: data.dateFinished || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  });
}

const AnimeModel = {
  getAll() {
    return [...getState().animes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(cloneAnime);
  },

  getById(id) {
    const row = getState().animes.find((anime) => anime.id === id);
    return cloneAnime(row);
  },

  create(data) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const anime = normalizeAnime({
      id,
      ...data,
      dateAdded: data.dateAdded || now,
      createdAt: now,
      updatedAt: now,
    });

    const state = getState();
    state.animes.push(anime);
    writeState(state);
    return cloneAnime(anime);
  },

  update(id, data) {
    const state = getState();
    const existing = state.animes.find((anime) => anime.id === id);
    if (!existing) return null;

    const merged = cloneAnime({
      ...existing,
      ...data,
      isFavorite: data.isFavorite !== undefined ? (data.isFavorite ? 1 : 0) : existing.isFavorite,
      updatedAt: new Date().toISOString(),
    });

    const index = state.animes.findIndex((anime) => anime.id === id);
    state.animes[index] = merged;
    writeState(state);
    return cloneAnime(merged);
  },

  delete(id) {
    const state = getState();
    const before = state.animes.length;
    state.animes = state.animes.filter((anime) => anime.id !== id);
    writeState(state);
    return state.animes.length < before;
  },

  count() {
    return getState().animes.length;
  },
};

module.exports = AnimeModel;
