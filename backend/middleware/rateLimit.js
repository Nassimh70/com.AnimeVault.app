const { rateLimit } = require('express-rate-limit');
const { env } = require('../config/env');

function jsonHandler(message) {
  return (req, res) => {
    res.status(429).json({ success: false, error: message });
  };
}

const skip = () => env.isTest;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  handler: jsonHandler('Trop de requêtes. Patiente quelques minutes avant de réessayer.'),
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  handler: jsonHandler('Trop de recherches externes. Patiente une minute.'),
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  handler: jsonHandler("Trop d'uploads d'images. Patiente avant de réessayer."),
});

module.exports = { apiLimiter, searchLimiter, uploadLimiter };
