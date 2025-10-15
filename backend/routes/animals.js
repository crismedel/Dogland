import express from 'express';
import {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalsByOrganization,
} from '../controllers/animalController.js';
import {
  getAnimalMedicalHistory,
  createMedicalHistory,
  getMedicalHistoryDetail,
  updateMedicalHistory,
  deleteMedicalHistory,
} from '../controllers/medicalHistoryController.js'
import { checkPermissions } from '../middlewares/permissions.js';
// Podrías crear validateAnimal.js igual que validateAlert.js
import { validateAnimal } from '../middlewares/validationAnimal.js';

const router = express.Router();

router.get('/animals', getAnimals);
router.get('/animals/:id', getAnimalById);

router.get('/animals/organization/:id',
  checkPermissions('view_organization_animals'),
  getAnimalsByOrganization
)

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



// Rutas anidadas para historial medico

router.get(
  '/animals/:id/medicalHistory',
  getAnimalMedicalHistory
);

router.post(
  '/animals/:id/medicalHistory',
  createMedicalHistory
);

router.get(
  '/animals/:id/medicalHistory/:historyId',
  getMedicalHistoryDetail
);

router.put(
  '/animals/:id/medicalHistory/:historyId',
  updateMedicalHistory
);

router.delete(
  '/animals/:id/medicalHistory/:historyId',
  deleteMedicalHistory
);

export default router;
