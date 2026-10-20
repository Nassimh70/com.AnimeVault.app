const express = require('express');
const multer = require('multer');
const UploadController = require('../controllers/uploadController');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

router.post('/', uploadLimiter, upload.single('image'), asyncHandler(UploadController.upload));

module.exports = router;
