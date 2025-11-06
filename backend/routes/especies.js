import express from 'express';
import { getEspecies } from '../controllers/especiesController.js';
// import { authenticateToken } from '../middlewares/auth.js'; // Descomenta si este catálogo es privado

const router = express.Router();

// Define la ruta GET /api/especies
router.get('/especies', getEspecies);

export default router;