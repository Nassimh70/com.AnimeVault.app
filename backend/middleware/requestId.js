const { randomUUID } = require('crypto');

/**
 * Attribue un identifiant unique à chaque requête, renvoyé dans l'en-tête
 * X-Request-Id et utilisé dans les journaux d'erreur.
 */
function requestId(req, res, next) {
  const incoming = req.get('x-request-id');
  req.id = incoming && incoming.length <= 100 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = { requestId };
