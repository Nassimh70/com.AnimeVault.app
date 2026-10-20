#!/usr/bin/env node
/**
 * Migration database.json -> MySQL.
 *
 * Usage : npm run db:import-json -- [--file <chemin>] [--dry-run]
 *
 * - sauvegarde le fichier source dans backend/backups/ ;
 * - valide chaque entrée sans interrompre l'import ;
 * - importe animes, relations (avec position), historique et réglages dans
 *   une seule transaction, de façon idempotente (UPSERT par id) ;
 * - vérifie ensuite les comptes et les champs, avec code de sortie non nul
 *   au moindre écart.
 */
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

const { env } = require('../config/env');
const { runMigrations } = require('./migrate');
const animeModel = require('../models/animeModel');
const { isValidDateOnly } = require('../utils/dates');

const STATUSES = new Set(['a_voir', 'en_cours', 'termine', 'pause', 'abandonne']);
const PRIORITIES = new Set(['haute', 'moyenne', 'faible']);
const LANGUAGES = new Set(['VOSTFR', 'VF', 'VO']);
const ACTIONS = new Set(['ajout', 'modification', 'progression', 'termine', 'suppression']);

const ANIME_COLUMNS = [
  'id',
  'title',
  'title_japanese',
  'image',
  'synopsis',
  'author',
  'episodes_total',
  'episodes_watched',
  'episode_duration',
  'release_date',
  'season',
  'status',
  'rating',
  'comment',
  'priority',
  'platform',
  'language',
  'mal_link',
  'anilist_link',
  'is_favorite',
  'date_added',
  'date_finished',
  'created_at',
  'updated_at',
];

function parseArgs(argv) {
  const args = { file: env.jsonBackupSource, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--dry-run') args.dryRun = true;
    if (argv[index] === '--file') {
      const value = argv[index + 1];
      if (!value) throw new Error('--file attend un chemin.');
      args.file = path.resolve(value);
      index += 1;
    }
  }
  return args;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function toDate(value, field, anomalies) {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    anomalies.push(`Date invalide pour ${field} : « ${value} » (valeur ignorée).`);
    return null;
  }
  return date;
}

function toInt(value, fallback, field, anomalies, { min = 0, max = 65535 } = {}) {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    anomalies.push(`Entier invalide pour ${field} : « ${value} » (valeur ${fallback} utilisée).`);
    return fallback;
  }
  return number;
}

function normalizeList(values, field, anomalies) {
  if (!Array.isArray(values)) {
    if (values !== undefined && values !== null) {
      anomalies.push(`${field} n’est pas un tableau (liste vide utilisée).`);
    }
    return [];
  }
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLocaleLowerCase('fr');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function validateAnime(raw, index, anomalies) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: `entrée #${index} : objet attendu.` };
  }
  if (typeof raw.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(raw.id)) {
    return { error: `entrée #${index} : identifiant UUID manquant ou invalide.` };
  }
  if (typeof raw.title !== 'string' || !raw.title.trim()) {
    return { error: `entrée #${index} : titre manquant.` };
  }
  if (raw.status && !STATUSES.has(raw.status)) {
    return { error: `entrée #${index} (${raw.title}) : statut inconnu « ${raw.status} ».` };
  }
  if (raw.priority && !PRIORITIES.has(raw.priority)) {
    return { error: `entrée #${index} (${raw.title}) : priorité inconnue « ${raw.priority} ».` };
  }
  if (raw.language && !LANGUAGES.has(raw.language)) {
    return { error: `entrée #${index} (${raw.title}) : langue inconnue « ${raw.language} ».` };
  }

  let releaseDate = null;
  if (raw.releaseDate) {
    if (isValidDateOnly(raw.releaseDate)) releaseDate = raw.releaseDate;
    else anomalies.push(`Date de sortie invalide pour « ${raw.title} » : « ${raw.releaseDate} » (NULL).`);
  }

  let rating = null;
  if (raw.rating !== null && raw.rating !== undefined && raw.rating !== '') {
    const numeric = Number(raw.rating);
    if (Number.isFinite(numeric) && numeric >= 0 && numeric <= 10) rating = numeric;
    else anomalies.push(`Note invalide pour « ${raw.title} » : « ${raw.rating} » (NULL).`);
  }

  for (const [field, value] of [
    ['malLink', raw.malLink],
    ['aniListLink', raw.aniListLink],
  ]) {
    if (value && !isHttpUrl(value)) {
      anomalies.push(`Lien ${field} non-URL pour « ${raw.title} » : « ${value} » → chaîne vide.`);
    }
  }

  const dateAdded = toDate(raw.dateAdded, `dateAdded de « ${raw.title} »`, anomalies);
  const createdAt = toDate(raw.createdAt, `createdAt de « ${raw.title} »`, anomalies);
  const updatedAt = toDate(raw.updatedAt, `updatedAt de « ${raw.title} »`, anomalies);
  const dateFinished = toDate(raw.dateFinished, `dateFinished de « ${raw.title} »`, anomalies);

  const record = {
    id: raw.id,
    title: raw.title.trim().slice(0, 255),
    title_japanese: typeof raw.titleJapanese === 'string' ? raw.titleJapanese : '',
    image: typeof raw.image === 'string' ? raw.image : '',
    synopsis: typeof raw.synopsis === 'string' ? raw.synopsis : '',
    author: typeof raw.author === 'string' ? raw.author : '',
    episodes_total: toInt(raw.episodesTotal, 0, 'episodesTotal', anomalies),
    episodes_watched: toInt(raw.episodesWatched, 0, 'episodesWatched', anomalies),
    episode_duration: toInt(raw.episodeDuration, 24, 'episodeDuration', anomalies, { min: 1, max: 600 }),
    release_date: releaseDate,
    season: typeof raw.season === 'string' ? raw.season.slice(0, 50) : '',
    status: raw.status || 'a_voir',
    rating,
    comment: typeof raw.comment === 'string' ? raw.comment : '',
    priority: raw.priority || 'moyenne',
    platform: typeof raw.platform === 'string' ? raw.platform.slice(0, 50) : '',
    language: raw.language || 'VOSTFR',
    mal_link: raw.malLink && isHttpUrl(raw.malLink) ? raw.malLink : '',
    anilist_link: raw.aniListLink && isHttpUrl(raw.aniListLink) ? raw.aniListLink : '',
    is_favorite: raw.isFavorite ? 1 : 0,
    date_added: dateAdded || createdAt || new Date(),
    date_finished: dateFinished,
    created_at: createdAt || dateAdded || new Date(),
    updated_at: updatedAt || createdAt || new Date(),
    genres: normalizeList(raw.genres, `genres de « ${raw.title} »`, anomalies),
    studios: normalizeList(raw.studios, `studios de « ${raw.title} »`, anomalies),
    tags: normalizeList(raw.tags, `tags de « ${raw.title} »`, anomalies),
    collections: normalizeList(raw.collections, `collections de « ${raw.title} »`, anomalies),
  };

  if (record.episodes_total > 0 && record.episodes_watched > record.episodes_total) {
    anomalies.push(
      `Progression supérieure au total pour « ${record.title} » (${record.episodes_watched}/${record.episodes_total}) : conservée telle quelle.`
    );
  }
  if (record.status === 'termine' && record.episodes_total > 0 && record.episodes_watched < record.episodes_total) {
    anomalies.push(
      `Anime terminé mais incomplet : « ${record.title} » (${record.episodes_watched}/${record.episodes_total}) — non corrigé.`
    );
  }
  if (record.synopsis && /\b0\.5\.\d+\b/.test(record.synopsis)) {
    anomalies.push(`Artefacts de citation dans le synopsis de « ${record.title} » — non modifié.`);
  }
  if (record.date_finished && record.status !== 'termine') {
    anomalies.push(`dateFinished présente alors que « ${record.title} » n’est pas terminé — conservée.`);
  }

  return { anime: record };
}

function validateHistory(raw, index, animeIds, anomalies) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: `historique #${index} : objet attendu.` };
  }
  if (typeof raw.id !== 'string' || !raw.id) {
    return { error: `historique #${index} : identifiant manquant.` };
  }
  if (!ACTIONS.has(raw.action)) {
    return { error: `historique #${index} : action inconnue « ${raw.action} ».` };
  }
  if (typeof raw.animeTitle !== 'string' || !raw.animeTitle.trim()) {
    return { error: `historique #${index} : animeTitle manquant.` };
  }
  if (!raw.animeId) {
    anomalies.push(`Entrée d’historique #${index} sans animeId (« ${raw.animeTitle} ») → anime_id NULL.`);
  } else if (!animeIds.has(raw.animeId)) {
    anomalies.push(
      `Entrée d’historique #${index} liée à un anime inconnu (« ${raw.animeTitle} ») → anime_id NULL.`
    );
  }
  return {
    history: {
      id: raw.id,
      anime_id: raw.animeId && animeIds.has(raw.animeId) ? raw.animeId : null,
      anime_title: raw.animeTitle.slice(0, 255),
      action: raw.action,
      details: typeof raw.details === 'string' ? raw.details.slice(0, 500) : '',
      created_at: toDate(raw.createdAt, `createdAt de l’historique #${index}`, anomalies) || new Date(),
    },
  };
}

function distinctCount(values) {
  return new Set(values.map((value) => value.trim().toLocaleLowerCase('fr'))).size;
}

function distinctExactCount(values) {
  return new Set(values.map((value) => value.trim())).size;
}

function normalizeRelationNames(values) {
  return values.map((value) => value.trim().toLocaleLowerCase('fr'));
}

/**
 * La collation utf8mb4_unicode_ci fusionne les libellés qui ne diffèrent que
 * par la casse. On conserve l’information pour la signaler explicitement.
 */
function reportCaseMerges(animes, anomalies) {
  for (const kind of ['genres', 'studios', 'tags', 'collections']) {
    const groups = new Map();
    for (const anime of animes) {
      for (const label of anime[kind]) {
        const key = label.toLocaleLowerCase('fr');
        if (!groups.has(key)) groups.set(key, new Set());
        groups.get(key).add(label);
      }
    }
    for (const labels of groups.values()) {
      if (labels.size > 1) {
        const list = [...labels].map((label) => `« ${label} »`).join(' et ');
        anomalies.push(
          `Libellés de ${kind} fusionnés par la collation insensible à la casse : ${list} → un seul enregistrement.`
        );
      }
    }
  }
}

async function createBackup(file) {
  await fs.mkdir(env.backupsDir, { recursive: true });
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 15);
  const parsed = path.parse(file);
  const target = path.join(env.backupsDir, `${parsed.name}-${stamp}${parsed.ext || '.json'}`);
  await fs.copyFile(file, target);
  return target;
}

async function upsertAnime(connection, anime) {
  const values = ANIME_COLUMNS.map((column) => (anime[column] === undefined ? null : anime[column]));
  const placeholders = ANIME_COLUMNS.map(() => '?').join(', ');
  const updates = ANIME_COLUMNS.filter((column) => column !== 'id')
    .map((column) => `${column} = VALUES(${column})`)
    .join(', ');
  const [existing] = await connection.query('SELECT id FROM animes WHERE id = ?', [anime.id]);
  await connection.query(
    `INSERT INTO animes (${ANIME_COLUMNS.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
    values
  );
  return existing.length > 0 ? 'updated' : 'inserted';
}

async function upsertHistory(connection, entry) {
  const [existing] = await connection.query('SELECT id FROM history WHERE id = ?', [entry.id]);
  await connection.query(
    `INSERT INTO history (id, anime_id, anime_title, action, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE anime_id = VALUES(anime_id), anime_title = VALUES(anime_title),
       action = VALUES(action), details = VALUES(details), created_at = VALUES(created_at)`,
    [entry.id, entry.anime_id, entry.anime_title, entry.action, entry.details, entry.created_at]
  );
  return existing.length > 0 ? 'updated' : 'inserted';
}

async function verify(connection, animes, history, anomalies) {
  const problems = [];
  const [animeCountRows] = await connection.query('SELECT COUNT(*) AS total FROM animes');
  const [historyCountRows] = await connection.query('SELECT COUNT(*) AS total FROM history');
  const [genreCountRows] = await connection.query('SELECT COUNT(*) AS total FROM genres');
  const [studioCountRows] = await connection.query('SELECT COUNT(*) AS total FROM studios');

  const animeCount = Number(animeCountRows[0].total);
  const historyCount = Number(historyCountRows[0].total);
  const genreCount = Number(genreCountRows[0].total);
  const studioCount = Number(studioCountRows[0].total);

  const expectedGenres = distinctCount(animes.flatMap((anime) => anime.genres));
  const expectedStudios = distinctCount(animes.flatMap((anime) => anime.studios));
  const rawStudioLabels = distinctExactCount(animes.flatMap((anime) => anime.studios));

  if (animeCount !== animes.length) {
    problems.push(`Animes : ${animeCount} en base, ${animes.length} attendus.`);
  }
  if (historyCount !== history.length) {
    problems.push(`Historique : ${historyCount} en base, ${history.length} attendus.`);
  }
  if (genreCount !== expectedGenres) {
    problems.push(`Genres : ${genreCount} en base, ${expectedGenres} attendus.`);
  }
  if (studioCount !== expectedStudios) {
    problems.push(`Studios : ${studioCount} en base, ${expectedStudios} attendus.`);
  }

  const [rows] = await connection.query(
    'SELECT * FROM animes WHERE id IN (?)',
    [animes.map((anime) => anime.id)]
  );
  const rowsById = new Map(rows.map((row) => [row.id, row]));
  for (const anime of animes) {
    const row = rowsById.get(anime.id);
    if (!row) {
      problems.push(`Anime absent : ${anime.title} (${anime.id}).`);
      continue;
    }
    const comparisons = [
      ['title', row.title, anime.title],
      ['status', row.status, anime.status],
      ['rating', row.rating === null ? null : Number(row.rating), anime.rating],
      ['episodes_watched', Number(row.episodes_watched), anime.episodes_watched],
      ['episodes_total', Number(row.episodes_total), anime.episodes_total],
      ['is_favorite', Boolean(row.is_favorite), Boolean(anime.is_favorite)],
      ['release_date', row.release_date || null, anime.release_date],
    ];
    for (const [field, actual, expected] of comparisons) {
      if (actual !== expected) {
        problems.push(`Champ ${field} différent pour « ${anime.title} » : ${actual} ≠ ${expected}.`);
      }
    }
    const relations = await animeModel.getRelationsForIds([anime.id], connection);
    const loaded = relations.get(anime.id);
    for (const kind of ['genres', 'studios', 'tags', 'collections']) {
      const actual = normalizeRelationNames(loaded[kind]);
      const expected = normalizeRelationNames(anime[kind]);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        problems.push(`Relations ${kind} différentes pour « ${anime.title} ».`);
      }
    }
  }

  const [orphanRows] = await connection.query(
    'SELECT COUNT(*) AS total FROM history WHERE anime_id IS NULL'
  );
  const sourceOrphans = history.filter((entry) => entry.anime_id === null).length;
  if (Number(orphanRows[0].total) !== sourceOrphans) {
    problems.push(
      `Historique sans anime_id : ${Number(orphanRows[0].total)} en base, ${sourceOrphans} attendu(s).`
    );
  }

  return {
    problems,
    counts: {
      animes: animeCount,
      history: historyCount,
      genres: genreCount,
      studios: studioCount,
      rawStudioLabels,
      expectedStudios,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = args.file;
  const sourceExists = await fs
    .access(source)
    .then(() => true)
    .catch(() => false);
  if (!sourceExists) throw new Error(`Fichier introuvable : ${source}`);

  const backup = await createBackup(source);
  console.log(`Sauvegarde créée : ${backup}`);

  const rawText = await fs.readFile(source, 'utf8');
  const payload = JSON.parse(rawText);
  const rawAnimes = Array.isArray(payload.animes) ? payload.animes : [];
  const rawHistory = Array.isArray(payload.history) ? payload.history : [];

  const anomalies = [];
  const animes = [];
  const skippedAnimes = [];
  for (let index = 0; index < rawAnimes.length; index += 1) {
    const result = validateAnime(rawAnimes[index], index, anomalies);
    if (result.error) {
      skippedAnimes.push(result.error);
      continue;
    }
    animes.push(result.anime);
  }

  const animeIds = new Set(animes.map((anime) => anime.id));
  const history = [];
  const skippedHistory = [];
  for (let index = 0; index < rawHistory.length; index += 1) {
    const result = validateHistory(rawHistory[index], index, animeIds, anomalies);
    if (result.error) {
      skippedHistory.push(result.error);
      continue;
    }
    history.push(result.history);
  }

  reportCaseMerges(animes, anomalies);

  console.log(`Lu : ${rawAnimes.length} animes, ${rawHistory.length} entrées d’historique.`);
  if (skippedAnimes.length) {
    console.log(`Animes ignorés (${skippedAnimes.length}) :`);
    skippedAnimes.forEach((message) => console.log(`  - ${message}`));
  }
  if (skippedHistory.length) {
    console.log(`Historique ignoré (${skippedHistory.length}) :`);
    skippedHistory.forEach((message) => console.log(`  - ${message}`));
  }

  const stats = {
    animesInserted: 0,
    animesUpdated: 0,
    historyInserted: 0,
    historyUpdated: 0,
  };

  await runMigrations({ silent: true });

  if (args.dryRun) {
    console.log('Mode --dry-run : aucune écriture en base.');
    console.log(
      `Simulation : ${animes.length} animes, ${history.length} entrées d’historique, ` +
        `${distinctCount(animes.flatMap((anime) => anime.genres))} genres, ` +
        `${distinctCount(animes.flatMap((anime) => anime.studios))} studios normalisés.`
    );
    printAnomalies(anomalies);
    return;
  }

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: ['DATE'],
    decimalNumbers: true,
    multipleStatements: false,
  });

  try {
    await connection.beginTransaction();
    for (const anime of animes) {
      const result = await upsertAnime(connection, anime);
      if (result === 'inserted') stats.animesInserted += 1;
      else stats.animesUpdated += 1;
      for (const kind of ['genres', 'studios', 'tags', 'collections']) {
        await animeModel.replaceRelations(anime.id, kind, anime[kind], connection);
      }
    }
    for (const entry of history) {
      const result = await upsertHistory(connection, entry);
      if (result === 'inserted') stats.historyInserted += 1;
      else stats.historyUpdated += 1;
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }

  const { problems, counts } = await verify(connection, animes, history, anomalies);
  await connection.end();

  console.log('\nRapport d’import');
  console.log(`  Animes     : ${stats.animesInserted} inséré(s), ${stats.animesUpdated} mis à jour, ${skippedAnimes.length} ignoré(s)`);
  console.log(`  Historique : ${stats.historyInserted} inséré(s), ${stats.historyUpdated} mis à jour, ${skippedHistory.length} ignoré(s)`);
  console.log(`  Genres     : ${counts.genres}`);
  console.log(
    `  Studios    : ${counts.studios} en base (${counts.rawStudioLabels} libellés distincts dans le JSON, ` +
      `${counts.expectedStudios} après fusion insensible à la casse)`
  );
  printAnomalies(anomalies);

  if (problems.length) {
    console.error('\n✖ Vérification échouée :');
    problems.forEach((problem) => console.error(`  - ${problem}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    `\n✔ Vérification OK : ${counts.animes} animes, ${counts.history} historiques, ` +
      `${counts.genres} genres, ${counts.studios} studios.`
  );
}

function printAnomalies(anomalies) {
  if (!anomalies.length) {
    console.log('  Anomalies  : aucune.');
    return;
  }
  const unique = [...new Set(anomalies)];
  console.log(`  Anomalies  : ${unique.length}`);
  unique.forEach((anomaly) => console.log(`    - ${anomaly}`));
}

main().catch((error) => {
  console.error(`\n✖ Import échoué : ${error.message}\n`);
  process.exitCode = 1;
});
