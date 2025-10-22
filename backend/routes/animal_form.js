import express from 'express';
// Importa TU controlador renombrado
import { createFullAnimal } from '../controllers/animal_formController.js'; 
// Importa el middleware de permisos (comentado por ahora)
// import { checkPermissions } from '../middlewares/permissions.js'; 

const router = express.Router();

// Define la ruta /full-animal. La URL final será /api/full-animal
router.post('/full-animal', /* checkPermissions('create_animal'), */ createFullAnimal);

export default router;
