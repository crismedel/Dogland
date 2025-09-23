import express from 'express';
import {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../controllers/animalController.js';

import { checkPermissions } from '../middlewares/permissions.js';
// Podrías crear validateAnimal.js igual que validateAlert.js
import { validateAnimal } from '../middlewares/validationAnimal.js';

const router = express.Router();

router.get('/animals', getAnimals);
router.get('/animals/:id', getAnimalById);

router.post(
  '/animals',
  validateAnimal,
  checkPermissions('create_animal'),
  createAnimal,
);

router.put(
  '/animals/:id',
  validateAnimal,
  checkPermissions('update_animal'),
  updateAnimal,
);

router.delete(
  '/animals/:id',
  checkPermissions('delete_animal'),
  deleteAnimal,
);

export default router;
