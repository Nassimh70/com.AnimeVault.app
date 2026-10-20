const express = require('express');
const JikanController = require('../controllers/jikanController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const { searchQuerySchema } = require('../validators/animeSchemas');
const { searchLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/search', searchLimiter, validate(searchQuerySchema, 'query'), asyncHandler(JikanController.search));

module.exports = router;
