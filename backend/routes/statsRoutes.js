const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/statsController');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', asyncHandler(StatsController.getStats));
router.get('/history', asyncHandler(StatsController.getHistory));

module.exports = router;
