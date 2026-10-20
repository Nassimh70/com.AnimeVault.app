/**
 * Schémas de validation zod. Les messages sont en français via la locale zod.
 */
const { z } = require('zod');
const { isValidDateOnly } = require('../utils/dates');

z.config(z.locales.fr());

const STATUSES = ['a_voir', 'en_cours', 'termine', 'pause', 'abandonne'];
const PRIORITIES = ['haute', 'moyenne', 'faible'];
const LANGUAGES = ['VOSTFR', 'VF', 'VO'];

function isHttpUrl(value) {
  if (value === '') return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isImageValue(value) {
  if (value === '') return true;
  if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(value)) return true;
  return isHttpUrl(value);
}

function isDateTimeInput(value) {
  if (value === '' || value === null) return true;
  if (isValidDateOnly(value)) return true;
  return !Number.isNaN(Date.parse(value));
}

function dedupeList(values, maxLength) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLocaleLowerCase('fr');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  if (result.some((value) => value.length > maxLength)) return { values: result, tooLong: true };
  return { values: result, tooLong: false };
}

function listSchema(maxLength) {
  return z
    .array(z.string())
    .transform((values) => dedupeList(values, maxLength))
    .superRefine((result, ctx) => {
      if (result.tooLong) {
        ctx.addIssue({
          code: 'custom',
          message: `Chaque élément doit faire ${maxLength} caractères maximum.`,
        });
      }
      if (result.values.length > 50) {
        ctx.addIssue({ code: 'custom', message: 'Maximum 50 éléments par liste.' });
      }
    })
    .transform((result) => result.values);
}

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Le titre est obligatoire.')
  .max(255, 'Le titre doit faire 255 caractères maximum.');

const shortTextSchema = (max, label) =>
  z.string().trim().max(max, `${label} doit faire ${max} caractères maximum.`);

const longTextSchema = (max, label) =>
  z.string().max(max, `${label} doit faire ${max} caractères maximum.`);

const dateOnlySchema = z
  .string()
  .trim()
  .refine((value) => value === '' || isValidDateOnly(value), 'Date invalide : utilise le format AAAA-MM-JJ.');

const dateTimeSchema = z
  .string()
  .trim()
  .refine(isDateTimeInput, 'Date invalide : utilise le format AAAA-MM-JJ ou ISO 8601.');

const linkSchema = z
  .string()
  .trim()
  .max(512, 'Le lien doit faire 512 caractères maximum.')
  .refine(isHttpUrl, 'Le lien doit commencer par http:// ou https:// (ou être vide).');

const imageSchema = z
  .string()
  .trim()
  .max(1024, "L'URL de l'image doit faire 1024 caractères maximum.")
  .refine(isImageValue, "L'image doit être une URL http(s) ou un chemin /uploads/…");

const ratingSchema = z
  .number({ error: 'La note doit être un nombre.' })
  .min(0, 'La note doit être comprise entre 0 et 10.')
  .max(10, 'La note doit être comprise entre 0 et 10.');

const integerSchema = (min, max, label) =>
  z.number({ error: `${label} doit être un nombre.` }).int(`${label} doit être un entier.`).min(min).max(max);

const fieldShapes = {
  title: titleSchema,
  titleJapanese: shortTextSchema(255, 'Le titre japonais'),
  image: imageSchema,
  synopsis: longTextSchema(20000, 'Le synopsis'),
  author: shortTextSchema(255, "L'auteur"),
  episodesTotal: integerSchema(0, 10000, 'Le nombre total d’épisodes'),
  episodesWatched: integerSchema(0, 10000, 'Le nombre d’épisodes vus'),
  episodeDuration: integerSchema(1, 600, 'La durée d’un épisode'),
  releaseDate: dateOnlySchema,
  season: shortTextSchema(50, 'La saison'),
  status: z.enum(STATUSES, { error: 'Statut invalide.' }),
  rating: ratingSchema.nullable(),
  comment: longTextSchema(20000, 'Le commentaire'),
  priority: z.enum(PRIORITIES, { error: 'Priorité invalide.' }),
  platform: shortTextSchema(50, 'La plateforme'),
  language: z.enum(LANGUAGES, { error: 'Langue invalide.' }),
  malLink: linkSchema,
  aniListLink: linkSchema,
  isFavorite: z.boolean({ error: 'Le favori doit être un booléen.' }),
  dateAdded: dateTimeSchema,
  dateFinished: z
    .union([dateTimeSchema, z.null()])
    .transform((value) => (value === '' ? null : value)),
};

const createAnimeSchema = z.object({
  title: fieldShapes.title,
  titleJapanese: fieldShapes.titleJapanese.default(''),
  image: fieldShapes.image.default(''),
  synopsis: fieldShapes.synopsis.default(''),
  genres: listSchema(100).default([]),
  studios: listSchema(150).default([]),
  author: fieldShapes.author.default(''),
  episodesTotal: fieldShapes.episodesTotal.default(0),
  episodesWatched: fieldShapes.episodesWatched.default(0),
  episodeDuration: fieldShapes.episodeDuration.default(24),
  releaseDate: fieldShapes.releaseDate.default(''),
  season: fieldShapes.season.default(''),
  status: fieldShapes.status.default('a_voir'),
  rating: fieldShapes.rating.default(null),
  comment: fieldShapes.comment.default(''),
  priority: fieldShapes.priority.default('moyenne'),
  platform: fieldShapes.platform.default(''),
  language: fieldShapes.language.default('VOSTFR'),
  malLink: fieldShapes.malLink.default(''),
  aniListLink: fieldShapes.aniListLink.default(''),
  isFavorite: fieldShapes.isFavorite.default(false),
  tags: listSchema(100).default([]),
  collections: listSchema(100).default([]),
  dateAdded: fieldShapes.dateAdded.optional(),
  dateFinished: fieldShapes.dateFinished.default(null),
});

const updateAnimeSchema = z.object({
  title: fieldShapes.title.optional(),
  titleJapanese: fieldShapes.titleJapanese.optional(),
  image: fieldShapes.image.optional(),
  synopsis: fieldShapes.synopsis.optional(),
  genres: listSchema(100).optional(),
  studios: listSchema(150).optional(),
  author: fieldShapes.author.optional(),
  episodesTotal: fieldShapes.episodesTotal.optional(),
  episodesWatched: fieldShapes.episodesWatched.optional(),
  episodeDuration: fieldShapes.episodeDuration.optional(),
  releaseDate: fieldShapes.releaseDate.optional(),
  season: fieldShapes.season.optional(),
  status: fieldShapes.status.optional(),
  rating: fieldShapes.rating.optional(),
  comment: fieldShapes.comment.optional(),
  priority: fieldShapes.priority.optional(),
  platform: fieldShapes.platform.optional(),
  language: fieldShapes.language.optional(),
  malLink: fieldShapes.malLink.optional(),
  aniListLink: fieldShapes.aniListLink.optional(),
  isFavorite: fieldShapes.isFavorite.optional(),
  tags: listSchema(100).optional(),
  collections: listSchema(100).optional(),
  dateAdded: fieldShapes.dateAdded.optional(),
  dateFinished: z.union([dateTimeSchema, z.null()]).optional().transform((value) => (value === '' ? null : value)),
});

const listQuerySchema = z.object({
  search: z.string().trim().max(200, 'La recherche doit faire 200 caractères maximum.').optional(),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  genre: z.string().trim().max(100).optional(),
  studio: z.string().trim().max(150).optional(),
  platform: z.string().trim().max(50).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  favorite: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  sortBy: z.enum(['createdAt', 'title', 'releaseDate', 'episodesTotal', 'rating', 'priority', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1, 'La page doit être supérieure ou égale à 1.').default(1),
  limit: z.coerce.number().int().min(1).max(100, 'La limite ne peut pas dépasser 100.').default(24),
});

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200, 'La limite ne peut pas dépasser 200.').default(50),
  animeId: z.string().uuid('Identifiant d’anime invalide.').optional(),
});

const progressSchema = z.union([
  z.object({ direction: z.enum(['increment', 'decrement'], { error: 'Direction invalide.' }) }),
  z.object({ episodesWatched: z.number().int().min(0).max(10000) }),
]);

const favoriteSchema = z.object({ isFavorite: z.boolean().optional() });

const settingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Le nom affiché est obligatoire.')
    .max(40, 'Le nom affiché doit faire 40 caractères maximum.'),
});

const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'La recherche doit contenir au moins 2 caractères.')
    .max(100, 'La recherche doit faire 100 caractères maximum.'),
});

const importPayloadSchema = z.union([
  z.array(z.unknown()).max(5000, 'Maximum 5000 animes par import.').transform((animes) => ({ animes })),
  z
    .object({ animes: z.array(z.unknown()).max(5000, 'Maximum 5000 animes par import.') })
    .transform((payload) => ({ animes: payload.animes })),
]);

const idSchema = z.string().uuid('Identifiant invalide.');
const idParamSchema = z.object({ id: idSchema });

const importEntrySchema = createAnimeSchema.extend({
  id: z.string().uuid().optional(),
  dateAdded: dateTimeSchema.optional(),
  createdAt: dateTimeSchema.optional(),
  updatedAt: dateTimeSchema.optional(),
});

module.exports = {
  STATUSES,
  PRIORITIES,
  LANGUAGES,
  createAnimeSchema,
  updateAnimeSchema,
  listQuerySchema,
  historyQuerySchema,
  progressSchema,
  favoriteSchema,
  settingsSchema,
  searchQuerySchema,
  importPayloadSchema,
  importEntrySchema,
  idSchema,
  idParamSchema,
};
