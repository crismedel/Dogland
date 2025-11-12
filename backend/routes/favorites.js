// routes/favorites.js
import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getCurrentUserFavorites,
} from '../controllers/favoritesController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  addFavoriteSchema,
  removeFavoriteSchema,
  getUserFavoritesSchema,
} from '../schemas/favorite.js';
import { ensureFavoriteOwner } from '../middlewares/ensureFavoriteOwner.js';

const router = express.Router();

router.post(
  '/favorites',
  authenticateToken,
  validateSchema(addFavoriteSchema),
  addFavorite,
);
router.delete(
  '/favorites/:animal_id',
  authenticateToken,
  validateSchema(removeFavoriteSchema),
  ensureFavoriteOwner,
  removeFavorite,
);
router.get(
  '/users/:user_id/favorites',
  authenticateToken,
  validateSchema(getUserFavoritesSchema),
  getUserFavorites,
);

router.get('/favorites', authenticateToken, getCurrentUserFavorites);

export default router;
