import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { createAnimalSchema } from '../schemas/animalPost.js'; 
import { crearAnimal } from '../controllers/animalPostController.js';

const router = express.Router();

/**
 * @route POST /api/animalsPost
 * @desc Registra un nuevo animal con sus fotos.
 * @access Private (requiere autenticación)
 */
router.post(
  '/animalsPost',
  authenticateToken, 
  validateSchema(createAnimalSchema), // <-- ¡CAMBIO AQUÍ! Sin el ', body'
  crearAnimal 
);

export default router;