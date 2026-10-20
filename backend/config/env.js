/**
 * Chargement et validation des variables d'environnement.
 * Aucun secret n'est stocké dans le code : tout passe par backend/.env.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Copie backend/.env.example vers backend/.env.`
    );
  }
  return String(value);
}

function toPort(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`La variable ${name} doit être un port valide (0-65535).`);
  }
  return port;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const dbName = required('DB_NAME', 'animevault');

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  throw new Error('DB_NAME ne peut contenir que des lettres, chiffres et underscores.');
}

const corsOrigin = required('CORS_ORIGIN', 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const env = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  isProduction: nodeEnv === 'production',
  port: toPort(required('PORT', '4000'), 'PORT'),
  db: {
    host: required('DB_HOST', '127.0.0.1'),
    port: toPort(required('DB_PORT', '3306'), 'DB_PORT'),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD ?? '',
    name: dbName,
  },
  corsOrigin,
  uploadsDir: path.join(__dirname, '..', 'uploads'),
  backupsDir: path.join(__dirname, '..', 'backups'),
  jsonBackupSource: path.join(__dirname, '..', 'database.json'),
};

module.exports = { env };
