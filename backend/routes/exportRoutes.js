const express = require('express');
const ExportController = require('../controllers/exportController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const { importPayloadSchema } = require('../validators/animeSchemas');

const router = express.Router();

router.get('/json', asyncHandler(ExportController.exportJSON));
router.get('/csv', asyncHandler(ExportController.exportCSV));
router.post('/import', validate(importPayloadSchema), asyncHandler(ExportController.importJSON));

module.exports = router;
