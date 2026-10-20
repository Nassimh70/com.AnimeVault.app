process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME || 'animevault_test';

const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const mysql = require('mysql2/promise');

const { env } = require('../config/env');
const { ensureDatabaseExists, runMigrations } = require('../db/migrate');
const database = require('../config/database');

env.uploadsDir = path.join(os.tmpdir(), 'animevault-test-uploads');

const TABLES = [
  'history',
  'anime_collections',
  'anime_tags',
  'anime_studios',
  'anime_genres',
  'animes',
  'collections',
  'tags',
  'studios',
  'genres',
  'settings',
];

async function adminConnection() {
  return mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    charset: 'utf8mb4',
    timezone: 'Z',
  });
}

async function setupTestDatabase() {
  await ensureDatabaseExists();
  await runMigrations({ silent: true });
  await fs.mkdir(env.uploadsDir, { recursive: true });
  await resetDatabase();
}

async function resetDatabase() {
  const connection = await adminConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.query("INSERT INTO settings (`key`, `value`) VALUES ('displayName', 'Nassim')");
  } finally {
    await connection.end();
  }
}

async function closeTestDatabase() {
  await database.closePool();
}

async function cleanUploads() {
  try {
    const files = await fs.readdir(env.uploadsDir);
    await Promise.all(files.map((file) => fs.unlink(path.join(env.uploadsDir, file))));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

module.exports = {
  setupTestDatabase,
  resetDatabase,
  closeTestDatabase,
  cleanUploads,
  adminConnection,
  PNG_1X1,
};
