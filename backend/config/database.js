/**
 * Pool MySQL (mysql2/promise) et helpers de transaction.
 * Toute la configuration de connexion est centralisée ici.
 */
const mysql = require('mysql2/promise');
const { env } = require('./env');

let pool = null;

const POOL_OPTIONS = {
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  dateStrings: ['DATE'],
  decimalNumbers: true,
};

function getPool() {
  if (!pool) {
    pool = mysql.createPool(POOL_OPTIONS);
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

/**
 * Exécute une fonction dans une transaction. Commit si succès, rollback sinon.
 * La connexion est toujours rendue au pool.
 */
async function withTransaction(fn) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Le rollback peut échouer si la connexion est déjà fermée ; l'erreur
      // d'origine reste prioritaire.
    }
    throw error;
  } finally {
    connection.release();
  }
}

function describeConnectionError(error) {
  const details = `hôte ${env.db.host}:${env.db.port}, base « ${env.db.name} », utilisateur « ${env.db.user} »`;
  if (error && ['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH', 'ENOTFOUND'].includes(error.code)) {
    return `Base de données injoignable (${details}). Vérifie que MySQL/MariaDB est démarré.`;
  }
  if (error && ['ER_ACCESS_DENIED_ERROR', 'ER_DBACCESS_DENIED_ERROR'].includes(error.code)) {
    return `Accès refusé à la base (${details}). Vérifie DB_USER et DB_PASSWORD dans backend/.env.`;
  }
  if (error && error.code === 'ER_BAD_DB_ERROR') {
    return `La base « ${env.db.name} » n'existe pas (${details}). Lance npm run db:migrate ou crée-la dans phpMyAdmin.`;
  }
  return `Connexion à la base impossible (${details}) : ${error.message}`;
}

/**
 * Attend que la base réponde, avec un back-off exponentiel.
 * Utilisé au démarrage du serveur et par le runner de migrations.
 */
async function waitForDatabase({ retries = 5 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await getPool().query('SELECT 1');
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** (attempt - 1) * 1000));
      }
    }
  }
  throw new Error(describeConnectionError(lastError));
}

async function ping() {
  await getPool().query('SELECT 1');
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  POOL_OPTIONS,
  getPool,
  query,
  execute,
  withTransaction,
  waitForDatabase,
  describeConnectionError,
  ping,
  closePool,
};
