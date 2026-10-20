const express = require('express');
const AnimeController = require('../controllers/animeController');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../middleware/validate');
const {
  listQuerySchema,
  historyQuerySchema,
  createAnimeSchema,
  updateAnimeSchema,
  progressSchema,
  favoriteSchema,
  idParamSchema,
} = require('../validators/animeSchemas');

const router = express.Router();

router.get('/', validate(listQuerySchema, 'query'), asyncHandler(AnimeController.list));
router.delete('/', asyncHandler(AnimeController.removeAll));
router.get('/meta', asyncHandler(AnimeController.getMeta));
router.get(
  '/:id/history',
  validate(idParamSchema, 'params'),
  validate(historyQuerySchema, 'query'),
  asyncHandler(AnimeController.history)
);
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(AnimeController.getOne));
router.post('/', validate(createAnimeSchema), asyncHandler(AnimeController.create));
router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateAnimeSchema),
  asyncHandler(AnimeController.update)
);
router.patch(
  '/:id/progress',
  validate(idParamSchema, 'params'),
  validate(progressSchema),
  asyncHandler(AnimeController.updateProgress)
);
router.patch(
  '/:id/favorite',
  validate(idParamSchema, 'params'),
  validate(favoriteSchema),
  asyncHandler(AnimeController.favorite)
);
router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(AnimeController.remove));

module.exports = router;
