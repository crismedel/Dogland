import express from 'express';
import { getRaces } from '../controllers/razasController.js';
// import { authenticateToken } from '../middlewares/auth.js'; // Descomenta si este catálogo es privado

const router = express.Router();

// Define la ruta GET /api/razas
router.get('/razas', getRaces);

export default router;