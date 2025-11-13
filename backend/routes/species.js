// backend/routes/species.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getAllSpecies } from '../controllers/speciesController.js';

const router = express.Router();

/**
 * @route GET /api/species
 * @desc Obtiene la lista de todas las especies.
 * @access Private
 */
router.get('/species', authenticateToken, getAllSpecies);

export default router;