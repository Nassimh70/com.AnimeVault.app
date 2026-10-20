/**
 * Export JSON/CSV et import JSON. Le CSV est conforme RFC 4180, protégé
 * contre l'injection de formules et préfixé d'un BOM UTF-8 pour Excel.
 */
const { randomUUID } = require('crypto');
const animeModel = require('../models/animeModel');
const { withTransaction } = require('../config/database');
const { toApiAnime } = require('../mappers/animeMapper');
const { importEntrySchema } = require('../validators/animeSchemas');
const { createWithinTransaction } = require('./animeService');

const CSV_COLUMNS = [
  'id',
  'title',
  'titleJapanese',
  'image',
  'synopsis',
  'genres',
  'studios',
  'author',
  'episodesTotal',
  'episodesWatched',
  'episodeDuration',
  'releaseDate',
  'season',
  'status',
  'rating',
  'comment',
  'priority',
  'platform',
  'language',
  'malLink',
  'aniListLink',
  'isFavorite',
  'tags',
  'collections',
  'dateAdded',
  'dateFinished',
  'createdAt',
  'updatedAt',
];

async function getAllAnimes() {
  const rows = await animeModel.findAll({ filters: {}, sortBy: 'createdAt', order: 'desc' });
  const relations = await animeModel.getRelationsForIds(rows.map((row) => row.id));
  return rows.map((row) => toApiAnime(row, relations.get(row.id)));
}

function cellToString(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('|');
  return String(value);
}

function guardFormula(value) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCsvCell(value) {
  const safe = guardFormula(cellToString(value));
  return `"${safe.replace(/"/g, '""')}"`;
}

function buildCsv(animes) {
  const lines = [CSV_COLUMNS.map((column) => escapeCsvCell(column)).join(',')];
  for (const anime of animes) {
    lines.push(CSV_COLUMNS.map((column) => escapeCsvCell(anime[column])).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

async function exportJson() {
  const animes = await getAllAnimes();
  return { exportedAt: new Date().toISOString(), count: animes.length, animes };
}

async function exportCsv() {
  const animes = await getAllAnimes();
  return buildCsv(animes);
}

async function importAnimes(entries) {
  const errors = [];
  let imported = 0;
  let skipped = 0;

  await withTransaction(async (conn) => {
    for (let index = 0; index < entries.length; index += 1) {
      const parsed = importEntrySchema.safeParse(entries[index]);
      if (!parsed.success) {
        skipped += 1;
        errors.push({
          index,
          message: parsed.error.issues[0]?.message || 'Entrée invalide.',
        });
        continue;
      }

      const data = parsed.data;
      const duplicate = await animeModel.findDuplicate(
        { title: data.title, releaseDate: data.releaseDate },
        conn
      );
      if (duplicate) {
        skipped += 1;
        errors.push({
          index,
          message: `Doublon ignoré : « ${data.title} » existe déjà à cette date de sortie.`,
        });
        continue;
      }

      let id = data.id || randomUUID();
      if (data.id) {
        const existing = await animeModel.findById(data.id, conn);
        if (existing) id = randomUUID();
      }

      await createWithinTransaction(data, conn, {
        id,
        skipDuplicateCheck: true,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        action: 'ajout',
        details: 'Importé depuis un fichier JSON',
      });
      imported += 1;
    }
  });

  return { imported, skipped, total: entries.length, errors };
}

module.exports = { CSV_COLUMNS, escapeCsvCell, buildCsv, exportJson, exportCsv, importAnimes, getAllAnimes };
