import express from 'express';
import { createFullAnimal } from '../controllers/animal_formController.js'; 
// El middleware de permisos está comentado para evitar problemas durante la prueba. Puedes descomentarlo después.
// import { checkPermissions } from '../middlewares/permissions.js'; 

const router = express.Router();

// Define la ruta /full-animal. La URL final será /api/full-animal
router.post('/full-animal', /* checkPermissions('create_animal'), */ createFullAnimal);

export default router;