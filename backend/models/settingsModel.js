/**
 * Modèle Settings — paires clé/valeur applicatives (displayName).
 */
const { getPool } = require('../config/database');

function db(conn) {
  return conn || getPool();
}

async function getAll(conn) {
  const [rows] = await db(conn).query('SELECT `key`, `value` FROM settings');
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

async function set(key, value, conn) {
  await db(conn).query(
    'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
    [key, value]
  );
}

module.exports = { getAll, set };
