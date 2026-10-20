const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/json', asyncHandler(ExportController.exportJSON));
router.get('/csv', asyncHandler(ExportController.exportCSV));
router.post('/import', asyncHandler(ExportController.importJSON));

module.exports = router;
