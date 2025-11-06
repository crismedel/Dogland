import express from 'express';
import { getEstadosSalud } from '../controllers/estadosSaludController.js';
// import { authenticateToken } from '../middlewares/auth.js'; // Descomenta si este catálogo es privado

const router = express.Router();

// Define la ruta GET /api/estados-salud
router.get('/estados-salud', getEstadosSalud);

export default router;