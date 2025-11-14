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
import { authenticateToken } from '../middlewares/auth.js';
import { checkPermissions } from '../middlewares/permissions.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createAnimalSchema,
  updateAnimalSchema,
  getAnimalByIdSchema,
  deleteAnimalSchema,
  getAllAnimalsSchema,
  getAnimalsByOrganizationSchema,
} from '../schemas/animal.js';
import {
  createMedicalHistorySchema,
  updateMedicalHistorySchema,
  getMedicalHistoryByAnimalSchema,
  getMedicalHistoryDetailSchema,
  deleteMedicalHistorySchema,
} from '../schemas/medicalHistory.js';

const router = express.Router();

router.get(
  '/animals',
  validateSchema(getAllAnimalsSchema),
  getAnimals
);

router.get(
  '/animals/:id',
  validateSchema(getAnimalByIdSchema),
  getAnimalById
);

router.get(
  '/animals/organization/:id',
  authenticateToken,
  validateSchema(getAnimalsByOrganizationSchema),
  checkPermissions('view_organization_animals'),
  getAnimalsByOrganization
);

router.post(
  '/animals',
  authenticateToken,
  validateSchema(createAnimalSchema),
  checkPermissions('create_animal'),
  createAnimal
);

router.put(
  '/animals/:id',
  authenticateToken,
  validateSchema(updateAnimalSchema),
  checkPermissions('update_animal'),
  updateAnimal
);

router.delete(
  '/animals/:id',
  authenticateToken,
  validateSchema(deleteAnimalSchema),
  checkPermissions('delete_animal'),
  deleteAnimal
);



// Rutas anidadas para historial medico

router.get(
  '/animals/:animalId/medicalHistory',
  validateSchema(getMedicalHistoryByAnimalSchema),
  getAnimalMedicalHistory
);

router.post(
  '/animals/:animalId/medicalHistory',
  authenticateToken,
  validateSchema(createMedicalHistorySchema),
  createMedicalHistory
);

router.get(
  '/animals/:animalId/medicalHistory/:historyId',
  validateSchema(getMedicalHistoryDetailSchema),
  getMedicalHistoryDetail
);

router.put(
  '/animals/:animalId/medicalHistory/:historyId',
  authenticateToken,
  validateSchema(updateMedicalHistorySchema),
  updateMedicalHistory
);

router.delete(
  '/animals/:animalId/medicalHistory/:historyId',
  authenticateToken,
  validateSchema(deleteMedicalHistorySchema),
  deleteMedicalHistory
);

export default router;
