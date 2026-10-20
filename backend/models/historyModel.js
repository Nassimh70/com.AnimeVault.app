const { getState, writeState } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const HistoryModel = {
  add(animeId, animeTitle, action, details = '') {
    const id = uuidv4();
    const state = getState();
    state.history.push({
      id,
      animeId,
      animeTitle,
      action,
      details,
      createdAt: new Date().toISOString(),
    });
    writeState(state);
    return id;
  },
  getAll(limit = 100) {
    return [...getState().history]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },
  getByAnime(animeId) {
    return [...getState().history]
      .filter((entry) => entry.animeId === animeId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

module.exports = HistoryModel;
