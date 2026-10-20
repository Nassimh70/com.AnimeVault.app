/**
 * Modèle History — journal des actions, conservé même après suppression
 * d'un anime (anime_id passe à NULL via la contrainte FK).
 */
const { getPool } = require('../config/database');

function db(conn) {
  return conn || getPool();
}

async function insert(entry, conn) {
  await db(conn).query(
    `INSERT INTO history (id, anime_id, anime_title, action, details, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.animeId || null,
      entry.animeTitle,
      entry.action,
      entry.details || '',
      entry.createdAt || new Date(),
    ]
  );
}

async function list({ limit = 50, animeId = null } = {}, conn) {
  const params = [];
  let sql = 'SELECT * FROM history';
  if (animeId) {
    sql += ' WHERE anime_id = ?';
    params.push(animeId);
  }
  sql += ' ORDER BY created_at DESC, id ASC LIMIT ?';
  params.push(limit);
  const [rows] = await db(conn).query(sql, params);
  return rows;
}

async function monthlyActivity(conn) {
  const [rows] = await db(conn).query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
    FROM history
    WHERE created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `);
  return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
}

async function removeAll(conn) {
  const [result] = await db(conn).query('DELETE FROM history');
  return result.affectedRows;
}

module.exports = { insert, list, monthlyActivity, removeAll };
