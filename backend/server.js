/**
 * Point d'entrée du serveur AnimeVault.
 * Attend la base, applique les migrations puis écoute sur PORT.
 */
const app = require('./app');
const { env } = require('./config/env');
const { waitForDatabase, closePool } = require('./config/database');
const { runMigrations } = require('./db/migrate');

let server = null;
let shuttingDown = false;

async function start() {
  try {
    await waitForDatabase();
    await runMigrations({ silent: true });
    server = app.listen(env.port, () => {
      console.log(`AnimeVault API démarrée sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error(`\n✖ Impossible de démarrer AnimeVault : ${error.message}\n`);
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\nArrêt reçu (${signal}), fermeture du serveur…`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();

module.exports = { start };
