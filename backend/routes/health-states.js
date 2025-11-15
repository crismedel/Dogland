// backend/routes/health-states.js
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getAllHealthStates } from '../controllers/health-statesController.js'; //llamamos al controlador

const router = express.Router();

/**
 * @route GET /api/health-states
 * @desc Obtiene la lista de todos los estados de salud.
 * @access Private
 */
router.get('/health-states', authenticateToken, getAllHealthStates);

export default router;