const multer = require('multer');
const { AppError } = require('../utils/errors');

const DATABASE_UNAVAILABLE_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'PROTOCOL_CONNECTION_LOST',
  'POOL_CLOSED',
]);

/**
 * Enveloppe un handler async pour propager les erreurs vers errorHandler.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let message = 'Erreur interne du serveur.';
  let details;

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? "L'image dépasse la taille maximale de 5 Mo."
        : 'Le fichier envoyé est invalide.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Le corps de la requête est trop volumineux (2 Mo maximum).';
  } else if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
    status = 400;
    message = 'Le JSON envoyé est invalide.';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'Cette ressource existe déjà.';
  } else if (DATABASE_UNAVAILABLE_CODES.has(err.code)) {
    status = 503;
    message = 'Base de données indisponible. Réessaie dans quelques instants.';
  }

  if (status >= 500) {
    const requestId = req.id || 'inconnu';
    console.error(`[${requestId}] ${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
  }

  const payload = { success: false, error: message };
  if (details) payload.details = details;
  res.status(status).json(payload);
}

module.exports = { asyncHandler, errorHandler };
