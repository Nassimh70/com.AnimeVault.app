class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    if (details) this.details = details;
  }
}

function badRequest(message, details) {
  return new AppError(400, message, details);
}

function notFound(message = 'Ressource introuvable.') {
  return new AppError(404, message);
}

function conflict(message) {
  return new AppError(409, message);
}

module.exports = { AppError, badRequest, notFound, conflict };
