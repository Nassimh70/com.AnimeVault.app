const express = require('express');
const router = express.Router();
const AnimeController = require('../controllers/animeController');
const { validateAnime } = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/', asyncHandler(AnimeController.list));
router.get('/:id', asyncHandler(AnimeController.getOne));
router.post('/', validateAnime, asyncHandler(AnimeController.create));
router.put('/:id', validateAnime, asyncHandler(AnimeController.update));
router.patch('/:id/progress', asyncHandler(AnimeController.updateProgress));
router.delete('/:id', asyncHandler(AnimeController.remove));

module.exports = router;
