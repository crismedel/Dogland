import express from 'express';
import { getRazas } from '../controllers/razasController.js';
// import { authenticateToken } from '../middlewares/auth.js'; // Descomenta si este catálogo es privado

const router = express.Router();

// Define la ruta GET /api/razas
router.get('/razas', getRazas);

export default router;