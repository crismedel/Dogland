import express from 'express';
// Importa TU controlador renombrado
import { getRaces } from '../controllers/races_formController.js';

const router = express.Router();

// Define la ruta /races. La URL final será /api/races
router.get('/races', getRaces);

export default router;
