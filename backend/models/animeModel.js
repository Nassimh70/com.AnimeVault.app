/**
 * Modèle Anime — seul endroit du backend (hors migrations/import) où l'on
 * trouve du SQL. Toutes les valeurs sont passées en paramètres liés.
 */
const { getPool } = require('../config/database');

const TAXONOMY = {
  genres: { table: 'genres', link: 'anime_genres', foreignKey: 'genre_id' },
  studios: { table: 'studios', link: 'anime_studios', foreignKey: 'studio_id' },
  tags: { table: 'tags', link: 'anime_tags', foreignKey: 'tag_id' },
  collections: { table: 'collections', link: 'anime_collections', foreignKey: 'collection_id' },
};

const INSERT_COLUMNS = [
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

const UPDATE_COLUMNS = INSERT_COLUMNS.filter((column) => !['id', 'created_at'].includes(column));

const SORT_COLUMNS = {
  createdAt: 'a.created_at',
  title: 'a.title',
  releaseDate: 'a.release_date',
  episodesTotal: 'a.episodes_total',
  rating: 'a.rating',
  priority:
    "CASE a.priority WHEN 'haute' THEN 1 WHEN 'moyenne' THEN 2 WHEN 'faible' THEN 3 ELSE 4 END",
  updatedAt: 'a.updated_at',
};

function db(conn) {
  return conn || getPool();
}

function escapeLike(value) {
  return value.replace(/[!%_]/g, (character) => `!${character}`);
}

function buildWhere(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    const like = `%${escapeLike(filters.search)}%`;
    clauses.push(`(
      a.title LIKE ? ESCAPE '!'
      OR a.title_japanese LIKE ? ESCAPE '!'
      OR EXISTS (
        SELECT 1 FROM anime_genres ag
        JOIN genres g ON g.id = ag.genre_id
        WHERE ag.anime_id = a.id AND g.name LIKE ? ESCAPE '!'
      )
      OR EXISTS (
        SELECT 1 FROM anime_studios ast
        JOIN studios s ON s.id = ast.studio_id
        WHERE ast.anime_id = a.id AND s.name LIKE ? ESCAPE '!'
      )
    )`);
    params.push(like, like, like, like);
  }

  if (filters.status) {
    clauses.push('a.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    clauses.push('a.priority = ?');
    params.push(filters.priority);
  }
  if (filters.platform) {
    clauses.push('a.platform = ?');
    params.push(filters.platform);
  }
  if (filters.year) {
    clauses.push('a.release_date >= ? AND a.release_date < ?');
    params.push(`${filters.year}-01-01`, `${Number(filters.year) + 1}-01-01`);
  }
  if (typeof filters.favorite === 'boolean') {
    clauses.push('a.is_favorite = ?');
    params.push(filters.favorite ? 1 : 0);
  }
  if (filters.genre) {
    clauses.push(`EXISTS (
      SELECT 1 FROM anime_genres ag
      JOIN genres g ON g.id = ag.genre_id
      WHERE ag.anime_id = a.id AND g.name = ?
    )`);
    params.push(filters.genre);
  }
  if (filters.studio) {
    clauses.push(`EXISTS (
      SELECT 1 FROM anime_studios ast
      JOIN studios s ON s.id = ast.studio_id
      WHERE ast.anime_id = a.id AND s.name = ?
    )`);
    params.push(filters.studio);
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

async function findAll({ filters = {}, sortBy = 'createdAt', order = 'desc', limit, offset = 0 } = {}, conn) {
  const where = buildWhere(filters);
  const column = SORT_COLUMNS[sortBy] || SORT_COLUMNS.createdAt;
  const direction = order === 'asc' ? 'ASC' : 'DESC';
  let sql = `SELECT a.* FROM animes a ${where.sql}
    ORDER BY (${column} IS NULL) ASC, ${column} ${direction}, a.id ASC`;
  const params = [...where.params];
  if (Number.isInteger(limit)) {
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
  }
  const [rows] = await db(conn).query(sql, params);
  return rows;
}

async function countAll(filters = {}, conn) {
  const where = buildWhere(filters);
  const [rows] = await db(conn).query(`SELECT COUNT(*) AS total FROM animes a ${where.sql}`, where.params);
  return Number(rows[0]?.total ?? 0);
}

async function findById(id, conn) {
  const [rows] = await db(conn).query('SELECT * FROM animes WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByIdForUpdate(id, conn) {
  const [rows] = await db(conn).query('SELECT * FROM animes WHERE id = ? LIMIT 1 FOR UPDATE', [id]);
  return rows[0] || null;
}

async function findDuplicate({ title, releaseDate, excludeId = null }, conn) {
  const params = [title, releaseDate || null];
  let sql = 'SELECT id FROM animes WHERE title = ? AND release_date <=> ?';
  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }
  sql += ' LIMIT 1';
  const [rows] = await db(conn).query(sql, params);
  return rows[0] || null;
}

async function insert(record, conn) {
  const placeholders = INSERT_COLUMNS.map(() => '?').join(', ');
  const values = INSERT_COLUMNS.map((column) => (record[column] === undefined ? null : record[column]));
  await db(conn).query(`INSERT INTO animes (${INSERT_COLUMNS.join(', ')}) VALUES (${placeholders})`, values);
  return record.id;
}

async function updateFields(id, fields, conn) {
  const columns = Object.keys(fields).filter((column) => UPDATE_COLUMNS.includes(column));
  if (columns.length === 0) return;
  const assignments = columns.map((column) => `${column} = ?`).join(', ');
  const values = columns.map((column) => (fields[column] === undefined ? null : fields[column]));
  await db(conn).query(`UPDATE animes SET ${assignments} WHERE id = ?`, [...values, id]);
}

async function remove(id, conn) {
  const [result] = await db(conn).query('DELETE FROM animes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function removeAll(conn) {
  const [result] = await db(conn).query('DELETE FROM animes');
  return result.affectedRows;
}

async function countByImage(image, conn) {
  const [rows] = await db(conn).query('SELECT COUNT(*) AS total FROM animes WHERE image = ?', [image]);
  return Number(rows[0]?.total ?? 0);
}

async function upsertTaxonomy(kind, names, conn) {
  const meta = TAXONOMY[kind];
  if (!meta) throw new Error(`Type de taxonomie inconnu : ${kind}`);

  const ids = [];
  for (const name of names) {
    await db(conn).query(`INSERT INTO ${meta.table} (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)`, [
      name,
    ]);
    const [rows] = await db(conn).query(`SELECT id FROM ${meta.table} WHERE name = ? LIMIT 1`, [name]);
    if (rows[0]) ids.push(rows[0].id);
  }
  return ids;
}

async function replaceRelations(animeId, kind, names, conn) {
  const meta = TAXONOMY[kind];
  if (!meta) throw new Error(`Type de taxonomie inconnu : ${kind}`);

  await db(conn).query(`DELETE FROM ${meta.link} WHERE anime_id = ?`, [animeId]);
  if (!names || names.length === 0) return;

  const ids = await upsertTaxonomy(kind, names, conn);
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '(?, ?, ?)').join(', ');
  const values = ids.flatMap((id, index) => [animeId, id, index]);
  await db(conn).query(
    `INSERT INTO ${meta.link} (anime_id, ${meta.foreignKey}, position) VALUES ${placeholders}`,
    values
  );
}

async function getRelationsForIds(ids, conn) {
  const result = new Map();
  for (const id of ids) {
    result.set(id, { genres: [], studios: [], tags: [], collections: [] });
  }
  if (ids.length === 0) return result;

  const queries = [
    {
      kind: 'genres',
      sql: `SELECT ag.anime_id, g.name FROM anime_genres ag
            JOIN genres g ON g.id = ag.genre_id
            WHERE ag.anime_id IN (?) ORDER BY ag.anime_id, ag.position, g.name`,
    },
    {
      kind: 'studios',
      sql: `SELECT ast.anime_id, s.name FROM anime_studios ast
            JOIN studios s ON s.id = ast.studio_id
            WHERE ast.anime_id IN (?) ORDER BY ast.anime_id, ast.position, s.name`,
    },
    {
      kind: 'tags',
      sql: `SELECT at.anime_id, t.name FROM anime_tags at
            JOIN tags t ON t.id = at.tag_id
            WHERE at.anime_id IN (?) ORDER BY at.anime_id, at.position, t.name`,
    },
    {
      kind: 'collections',
      sql: `SELECT ac.anime_id, c.name FROM anime_collections ac
            JOIN collections c ON c.id = ac.collection_id
            WHERE ac.anime_id IN (?) ORDER BY ac.anime_id, ac.position, c.name`,
    },
  ];

  for (const { kind, sql } of queries) {
    const [rows] = await db(conn).query(sql, [ids]);
    for (const row of rows) {
      const entry = result.get(row.anime_id);
      if (entry) entry[kind].push(row.name);
    }
  }
  return result;
}

async function getMeta(conn) {
  const [genres] = await db(conn).query(`
    SELECT g.name, COUNT(*) AS count
    FROM genres g JOIN anime_genres ag ON ag.genre_id = g.id
    GROUP BY g.id, g.name ORDER BY count DESC, g.name ASC
  `);
  const [studios] = await db(conn).query(`
    SELECT s.name, COUNT(*) AS count
    FROM studios s JOIN anime_studios ast ON ast.studio_id = s.id
    GROUP BY s.id, s.name ORDER BY count DESC, s.name ASC
  `);
  const [tags] = await db(conn).query(`
    SELECT t.name, COUNT(*) AS count
    FROM tags t JOIN anime_tags at ON at.tag_id = t.id
    GROUP BY t.id, t.name ORDER BY count DESC, t.name ASC
  `);
  const [collections] = await db(conn).query(`
    SELECT c.name, COUNT(*) AS count
    FROM collections c JOIN anime_collections ac ON ac.collection_id = c.id
    GROUP BY c.id, c.name ORDER BY count DESC, c.name ASC
  `);
  const [platforms] = await db(conn).query(`
    SELECT DISTINCT platform FROM animes WHERE platform <> '' ORDER BY platform ASC
  `);
  const [years] = await db(conn).query(`
    SELECT DISTINCT YEAR(release_date) AS year FROM animes
    WHERE release_date IS NOT NULL ORDER BY year DESC
  `);

  return {
    genres: genres.map((row) => ({ name: row.name, count: Number(row.count) })),
    studios: studios.map((row) => ({ name: row.name, count: Number(row.count) })),
    tags: tags.map((row) => ({ name: row.name, count: Number(row.count) })),
    collections: collections.map((row) => ({ name: row.name, count: Number(row.count) })),
    platforms: platforms.map((row) => row.platform),
    years: years.map((row) => Number(row.year)),
  };
}

module.exports = {
  SORT_COLUMNS,
  TAXONOMY,
  findAll,
  countAll,
  findById,
  findByIdForUpdate,
  findDuplicate,
  insert,
  updateFields,
  remove,
  removeAll,
  countByImage,
  replaceRelations,
  getRelationsForIds,
  getMeta,
};
