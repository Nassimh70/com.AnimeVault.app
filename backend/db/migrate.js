/**
 * Runner de migrations idempotent.
 * Chaque fichier .sql de db/migrations est appliqué une seule fois,
 * puis enregistré dans la table schema_migrations.
 */
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
const { env } = require('../config/env');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function adminConnectionOptions() {
  return {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    connectTimeout: 10000,
    charset: 'utf8mb4',
  };
}

async function ensureDatabaseExists() {
  let connection;
  try {
    connection = await mysql.createConnection(adminConnectionOptions());
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } catch (error) {
    if (error.code === 'ER_DBACCESS_DENIED_ERROR' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(
        `Impossible de créer la base « ${env.db.name} » avec l'utilisateur « ${env.db.user} ». ` +
          `Crée-la manuellement dans phpMyAdmin puis relance npm run db:migrate.`
      );
    }
    throw new Error(
      `Impossible de joindre ${env.db.host}:${env.db.port} pour préparer la base : ${error.message}`
    );
  } finally {
    if (connection) await connection.end();
  }
}

async function listMigrationFiles() {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files.filter((file) => file.endsWith('.sql')).sort();
}

async function runMigrations({ silent = false } = {}) {
  await ensureDatabaseExists();

  const connection = await mysql.createConnection({
    ...adminConnectionOptions(),
    database: env.db.name,
    multipleStatements: true,
    timezone: 'Z',
    decimalNumbers: true,
  });

  const applied = [];
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       VARCHAR(255) NOT NULL,
        applied_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [rows] = await connection.query('SELECT name FROM schema_migrations');
    const alreadyApplied = new Set(rows.map((row) => row.name));
    const files = await listMigrationFiles();

    for (const file of files) {
      if (alreadyApplied.has(file)) continue;
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
      applied.push(file);
      if (!silent) console.log(`  ✔ Migration appliquée : ${file}`);
    }

    if (!silent) {
      const skipped = files.length - applied.length;
      console.log(
        `Migrations terminées sur « ${env.db.name} » : ${applied.length} appliquée(s), ${skipped} déjà présente(s).`
      );
    }
    return applied;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(`\n✖ Migrations échouées : ${error.message}\n`);
      process.exit(1);
    });
}

module.exports = { runMigrations, ensureDatabaseExists, listMigrationFiles };
