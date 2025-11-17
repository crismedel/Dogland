// routes/favorites.js
import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  getCurrentUserFavorites,
} from '../controllers/favoritesController.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(addFavoriteSchema),
  addFavorite,
);
router.delete(
  '/favorites/:animal_id',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(removeFavoriteSchema),
  ensureFavoriteOwner,
  removeFavorite,
);
router.get(
  '/users/:user_id/favorites',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(getUserFavoritesSchema),
  getUserFavorites,
);

router.get(
  '/favorites',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  getCurrentUserFavorites,
);

export default router;
