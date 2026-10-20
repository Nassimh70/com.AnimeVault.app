/**
 * Middleware global de gestion des erreurs.
 * Toute route qui `next(err)` ou lève une exception async (via asyncHandler) arrive ici.
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Erreur API:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Erreur interne du serveur',
  });
}

// Enveloppe les handlers async pour propager les erreurs vers errorHandler
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
