const express = require('express');
const router = express.Router();
const JikanController = require('../controllers/jikanController');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/search', asyncHandler(JikanController.search));

module.exports = router;
