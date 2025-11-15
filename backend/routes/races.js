// backend/routes/races.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getAllRaces } from '../controllers/racesController.js';

const router = express.Router();

/**
 * @route GET /api/races
 * @desc Obtiene la lista de todas las razas.
 * @query ?id_especie=1 - Opcional: filtra las razas por ID de especie.
 * @access Private
 */
router.get('/races', authenticateToken, getAllRaces);

export default router;