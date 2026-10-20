/**
 * Logique métier des animes : transactions, relations, historique,
 * progression et nettoyage des images.
 */
const { randomUUID } = require('crypto');
const animeModel = require('../models/animeModel');
const historyModel = require('../models/historyModel');
const { withTransaction } = require('../config/database');
const { toApiAnime, toApiHistory } = require('../mappers/animeMapper');
const { toDbDate, toDbDateTime } = require('../utils/dates');
const { conflict, notFound } = require('../utils/errors');
const { removeImageIfOrphan, cleanupOrphanUploads } = require('./uploadService');

const RELATION_KINDS = ['genres', 'studios', 'tags', 'collections'];

function nowDate() {
  return new Date();
}

async function mapRow(row, conn) {
  if (!row) return null;
  const relations = await animeModel.getRelationsForIds([row.id], conn);
  return toApiAnime(row, relations.get(row.id));
}

async function getById(id, conn) {
  const row = await animeModel.findById(id, conn);
  if (!row) throw notFound('Anime introuvable.');
  return mapRow(row, conn);
}

async function listAnimes(query, conn) {
  const filters = {
    search: query.search || undefined,
    status: query.status || undefined,
    priority: query.priority || undefined,
    genre: query.genre || undefined,
    studio: query.studio || undefined,
    platform: query.platform || undefined,
    year: query.year || undefined,
    favorite: query.favorite,
  };
  const offset = (query.page - 1) * query.limit;
  const [rows, count] = await Promise.all([
    animeModel.findAll(
      { filters, sortBy: query.sortBy, order: query.order, limit: query.limit, offset },
      conn
    ),
    animeModel.countAll(filters, conn),
  ]);
  const relations = await animeModel.getRelationsForIds(
    rows.map((row) => row.id),
    conn
  );
  const data = rows.map((row) => toApiAnime(row, relations.get(row.id)));
  return {
    data,
    count,
    page: query.page,
    limit: query.limit,
    hasMore: offset + data.length < count,
  };
}

function buildRecord(input, { id, createdAt, updatedAt } = {}) {
  const now = nowDate();
  return {
    id,
    title: input.title,
    title_japanese: input.titleJapanese ?? '',
    image: input.image ?? '',
    synopsis: input.synopsis ?? '',
    author: input.author ?? '',
    episodes_total: input.episodesTotal ?? 0,
    episodes_watched: input.episodesWatched ?? 0,
    episode_duration: input.episodeDuration ?? 24,
    release_date: toDbDate(input.releaseDate),
    season: input.season ?? '',
    status: input.status ?? 'a_voir',
    rating: input.rating ?? null,
    comment: input.comment ?? '',
    priority: input.priority ?? 'moyenne',
    platform: input.platform ?? '',
    language: input.language ?? 'VOSTFR',
    mal_link: input.malLink ?? '',
    anilist_link: input.aniListLink ?? '',
    is_favorite: input.isFavorite ? 1 : 0,
    date_added: input.dateAdded ? toDbDateTime(input.dateAdded) || now : now,
    date_finished:
      (input.status ?? 'a_voir') === 'termine'
        ? toDbDateTime(input.dateFinished) || now
        : toDbDateTime(input.dateFinished),
    created_at: createdAt || now,
    updated_at: updatedAt || now,
  };
}

/**
 * Création utilisée par POST /animes et par l'import. Doit être appelée
 * dans une transaction déjà ouverte.
 */
async function createWithinTransaction(input, conn, options = {}) {
  const id = options.id || randomUUID();
  const record = buildRecord(input, {
    id,
    createdAt: options.createdAt,
    updatedAt: options.updatedAt,
  });

  if (!options.skipDuplicateCheck) {
    const duplicate = await animeModel.findDuplicate(
      { title: record.title, releaseDate: record.release_date },
      conn
    );
    if (duplicate) {
      throw conflict('Un anime avec ce titre et cette date de sortie existe déjà.');
    }
  }

  await animeModel.insert(record, conn);
  for (const kind of RELATION_KINDS) {
    await animeModel.replaceRelations(id, kind, input[kind] || [], conn);
  }
  await historyModel.insert(
    {
      id: randomUUID(),
      animeId: id,
      animeTitle: record.title,
      action: options.action || 'ajout',
      details: options.details || 'Anime ajouté à la bibliothèque',
    },
    conn
  );
  return id;
}

async function createAnime(input) {
  return withTransaction(async (conn) => {
    const id = await createWithinTransaction(input, conn);
    return getById(id, conn);
  });
}

const UPDATE_FIELD_MAP = {
  title: 'title',
  titleJapanese: 'title_japanese',
  image: 'image',
  synopsis: 'synopsis',
  author: 'author',
  episodesTotal: 'episodes_total',
  episodesWatched: 'episodes_watched',
  episodeDuration: 'episode_duration',
  releaseDate: 'release_date',
  season: 'season',
  status: 'status',
  rating: 'rating',
  comment: 'comment',
  priority: 'priority',
  platform: 'platform',
  language: 'language',
  malLink: 'mal_link',
  aniListLink: 'anilist_link',
  isFavorite: 'is_favorite',
  dateAdded: 'date_added',
  dateFinished: 'date_finished',
};

function toDbValue(field, value) {
  if (field === 'release_date') return toDbDate(value);
  if (['date_added', 'date_finished'].includes(field)) return toDbDateTime(value);
  if (field === 'is_favorite') return value ? 1 : 0;
  return value === undefined ? null : value;
}

async function updateAnime(id, input) {
  const result = await withTransaction(async (conn) => {
    const row = await animeModel.findByIdForUpdate(id, conn);
    if (!row) throw notFound('Anime introuvable.');

    const nextTitle = input.title !== undefined ? input.title : row.title;
    const nextReleaseDate = input.releaseDate !== undefined ? input.releaseDate : row.release_date || '';

    if (nextTitle !== row.title || nextReleaseDate !== (row.release_date || '')) {
      const duplicate = await animeModel.findDuplicate(
        { title: nextTitle, releaseDate: nextReleaseDate, excludeId: id },
        conn
      );
      if (duplicate) throw conflict('Un anime avec ce titre et cette date de sortie existe déjà.');
    }

    const fields = {};
    for (const [key, column] of Object.entries(UPDATE_FIELD_MAP)) {
      if (input[key] !== undefined) fields[column] = toDbValue(column, input[key]);
    }

    const nextStatus = input.status !== undefined ? input.status : row.status;
    if (input.status !== undefined) {
      fields.status = nextStatus;
      if (nextStatus === 'termine') {
        const requested = input.dateFinished !== undefined ? toDbDateTime(input.dateFinished) : null;
        fields.date_finished = requested || row.date_finished || nowDate();
      } else {
        fields.date_finished = null;
      }
    } else if (input.dateFinished !== undefined) {
      if (nextStatus === 'termine') {
        fields.date_finished = toDbDateTime(input.dateFinished) || row.date_finished || nowDate();
      } else {
        fields.date_finished = null;
      }
    }

    const nextTotal = input.episodesTotal !== undefined ? input.episodesTotal : Number(row.episodes_total);
    let nextWatched = input.episodesWatched !== undefined ? input.episodesWatched : Number(row.episodes_watched);
    if (nextTotal > 0) nextWatched = Math.min(nextWatched, nextTotal);
    if (nextWatched !== Number(row.episodes_watched)) fields.episodes_watched = nextWatched;

    fields.updated_at = nowDate();
    await animeModel.updateFields(id, fields, conn);

    for (const kind of RELATION_KINDS) {
      if (input[kind] !== undefined) {
        await animeModel.replaceRelations(id, kind, input[kind], conn);
      }
    }

    const becameFinished = nextStatus === 'termine' && row.status !== 'termine';
    await historyModel.insert(
      {
        id: randomUUID(),
        animeId: id,
        animeTitle: nextTitle,
        action: becameFinished ? 'termine' : 'modification',
        details: becameFinished ? 'Anime marqué comme terminé' : 'Fiche mise à jour',
      },
      conn
    );

    return {
      anime: await getById(id, conn),
      previousImage: row.image,
      nextImage: input.image !== undefined ? input.image : row.image,
    };
  });

  if (result.previousImage && result.previousImage !== result.nextImage) {
    await removeImageIfOrphan(result.previousImage);
  }
  return result.anime;
}

async function updateProgress(id, payload) {
  return withTransaction(async (conn) => {
    const row = await animeModel.findByIdForUpdate(id, conn);
    if (!row) throw notFound('Anime introuvable.');

    const total = Number(row.episodes_total);
    const current = Number(row.episodes_watched);
    const isDirection = Object.prototype.hasOwnProperty.call(payload, 'direction');
    const nextRaw = isDirection
      ? current + (payload.direction === 'increment' ? 1 : -1)
      : payload.episodesWatched;
    let watched = Math.max(0, nextRaw);
    if (total > 0) watched = Math.min(watched, total);

    const today = nowDate();
    let status = row.status;
    let dateFinished = row.date_finished;

    if (total > 0 && watched >= total) {
      status = 'termine';
      if (!dateFinished) dateFinished = today;
    } else if (watched < current && row.status === 'termine') {
      status = 'en_cours';
      dateFinished = null;
    } else if (row.status === 'a_voir' && watched > 0) {
      status = 'en_cours';
    }

    await animeModel.updateFields(
      id,
      {
        episodes_watched: watched,
        status,
        date_finished: dateFinished,
        updated_at: today,
      },
      conn
    );

    await historyModel.insert(
      {
        id: randomUUID(),
        animeId: id,
        animeTitle: row.title,
        action: 'progression',
        details: `Épisode ${watched}/${total > 0 ? total : '?'}`,
      },
      conn
    );

    return getById(id, conn);
  });
}

async function toggleFavorite(id, isFavorite) {
  return withTransaction(async (conn) => {
    const row = await animeModel.findByIdForUpdate(id, conn);
    if (!row) throw notFound('Anime introuvable.');
    const next = isFavorite === undefined ? !Boolean(row.is_favorite) : Boolean(isFavorite);
    await animeModel.updateFields(id, { is_favorite: next ? 1 : 0, updated_at: nowDate() }, conn);
    return getById(id, conn);
  });
}

async function removeAnime(id) {
  const removed = await withTransaction(async (conn) => {
    const row = await animeModel.findByIdForUpdate(id, conn);
    if (!row) throw notFound('Anime introuvable.');
    await animeModel.remove(id, conn);
    await historyModel.insert(
      {
        id: randomUUID(),
        animeId: null,
        animeTitle: row.title,
        action: 'suppression',
        details: 'Anime supprimé de la bibliothèque',
      },
      conn
    );
    return { id: row.id, title: row.title, image: row.image };
  });

  await removeImageIfOrphan(removed.image);
  return { id: removed.id, title: removed.title };
}

async function removeAllAnimes() {
  const deleted = await withTransaction(async (conn) => animeModel.removeAll(conn));
  const filesRemoved = await cleanupOrphanUploads();
  return { deleted, filesRemoved };
}

async function getAnimeHistory(id, limit) {
  const row = await animeModel.findById(id);
  if (!row) throw notFound('Anime introuvable.');
  const entries = await historyModel.list({ animeId: id, limit });
  return entries.map(toApiHistory);
}

async function getMeta() {
  return animeModel.getMeta();
}

module.exports = {
  listAnimes,
  getById,
  createAnime,
  createWithinTransaction,
  updateAnime,
  updateProgress,
  toggleFavorite,
  removeAnime,
  removeAllAnimes,
  getAnimeHistory,
  getMeta,
  mapRow,
};
