import express from 'express';
// Importa TU controlador renombrado
import { getHealthStates } from '../controllers/healthStates_formController.js';

const router = express.Router();

// Define la ruta /health-states. La URL final será /api/health-states
router.get('/health-states', getHealthStates);

export default router;
