const express = require('express');
const StatsController = require('../controllers/statsController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const { historyQuerySchema } = require('../validators/animeSchemas');

const router = express.Router();

router.get('/', asyncHandler(StatsController.getStats));
router.get('/history', validate(historyQuerySchema, 'query'), asyncHandler(StatsController.getHistory));
router.delete('/history', asyncHandler(StatsController.clearHistory));

module.exports = router;
