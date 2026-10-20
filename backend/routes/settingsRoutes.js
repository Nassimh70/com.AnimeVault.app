const express = require('express');
const SettingsController = require('../controllers/settingsController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const { settingsSchema } = require('../validators/animeSchemas');

const router = express.Router();

router.get('/', asyncHandler(SettingsController.get));
router.put('/', validate(settingsSchema), asyncHandler(SettingsController.update));

module.exports = router;
