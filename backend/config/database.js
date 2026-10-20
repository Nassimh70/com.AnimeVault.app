/**
 * Stockage JSON persistant pour éviter les dépendances natives sur Windows.
 * Les données restent sur disque dans database.json.
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'database.json');
const UPLOADS_PATH = path.join(__dirname, '..', 'uploads');

const DEFAULT_STATE = {
  animes: [],
  history: [],
  settings: {},
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAnimeRecord(anime) {
  if (!anime || typeof anime !== 'object') return anime;
  return {
    ...anime,
    id: anime.id || uuidv4(),
  };
}

function readState() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      animes: Array.isArray(parsed.animes) ? parsed.animes.map(normalizeAnimeRecord) : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {},
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

let state = readState();

function writeState(nextState) {
  state = {
    animes: Array.isArray(nextState.animes) ? nextState.animes.map(normalizeAnimeRecord) : [],
    history: Array.isArray(nextState.history) ? nextState.history : [],
    settings: nextState.settings && typeof nextState.settings === 'object' ? nextState.settings : {},
  };
  fs.writeFileSync(DB_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function initDatabase() {
  if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    writeState(clone(DEFAULT_STATE));
    console.log('✅ Nouvelle base JSON créée avec succès :', DB_PATH);
  } else {
    state = readState();
    writeState(state);
    console.log('✅ Base JSON existante chargée :', DB_PATH);
  }
}

function getState() {
  return state;
}

module.exports = { initDatabase, getState, writeState, DB_PATH };
