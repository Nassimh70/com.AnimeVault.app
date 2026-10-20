/**
 * Modèle Stats — toutes les agrégations sont calculées en SQL.
 */
const { getPool } = require('../config/database');

function db(conn) {
  return conn || getPool();
}

async function globalCounts(conn) {
  const [rows] = await db(conn).query(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(status = 'termine'), 0) AS termine,
      COALESCE(SUM(status = 'en_cours'), 0) AS enCours,
      COALESCE(SUM(status = 'a_voir'), 0) AS aVoir,
      COALESCE(SUM(status = 'pause'), 0) AS pause,
      COALESCE(SUM(status = 'abandonne'), 0) AS abandonne,
      COALESCE(SUM(episodes_watched), 0) AS totalEpisodesWatched,
      COALESCE(SUM(episodes_watched * episode_duration), 0) AS totalMinutesWatched,
      COALESCE(SUM(GREATEST(CAST(episodes_total AS SIGNED) - CAST(episodes_watched AS SIGNED), 0)), 0) AS remainingEpisodes,
      COALESCE(SUM(GREATEST(CAST(episodes_total AS SIGNED) - CAST(episodes_watched AS SIGNED), 0) * episode_duration), 0) AS remainingMinutes,
      COALESCE(SUM(is_favorite = 1), 0) AS favoriteCount
    FROM animes
  `);
  const row = rows[0] || {};
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value ?? 0)]));
}

async function genreDistribution(conn) {
  const [rows] = await db(conn).query(`
    SELECT g.name, COUNT(*) AS value
    FROM genres g JOIN anime_genres ag ON ag.genre_id = g.id
    GROUP BY g.id, g.name ORDER BY value DESC, g.name ASC
  `);
  return rows.map((row) => ({ name: row.name, value: Number(row.value) }));
}

async function studioDistribution(conn) {
  const [rows] = await db(conn).query(`
    SELECT s.name, COUNT(*) AS value
    FROM studios s JOIN anime_studios ast ON ast.studio_id = s.id
    GROUP BY s.id, s.name ORDER BY value DESC, s.name ASC
  `);
  return rows.map((row) => ({ name: row.name, value: Number(row.value) }));
}

async function ratingDistribution(conn) {
  const [rows] = await db(conn).query(`
    SELECT ROUND(rating) AS rating, COUNT(*) AS count
    FROM animes WHERE rating IS NOT NULL
    GROUP BY ROUND(rating) ORDER BY rating ASC
  `);
  return rows.map((row) => ({ rating: Number(row.rating), count: Number(row.count) }));
}

async function lastAddedId(conn) {
  const [rows] = await db(conn).query('SELECT id FROM animes ORDER BY created_at DESC, id ASC LIMIT 1');
  return rows[0]?.id || null;
}

module.exports = { globalCounts, genreDistribution, studioDistribution, ratingDistribution, lastAddedId };
