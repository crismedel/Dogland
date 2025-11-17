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
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(getAnimalsByOrganizationSchema),
  getAnimalsByOrganization
);

router.post(
  '/animals',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(createAnimalSchema),
  createAnimal
);

router.put(
  '/animals/:id',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(updateAnimalSchema),
  updateAnimal
);

router.delete(
  '/animals/:id',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(deleteAnimalSchema),
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(updateMedicalHistorySchema),
  updateMedicalHistory
);

router.delete(
  '/animals/:animalId/medicalHistory/:historyId',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(deleteMedicalHistorySchema),
  deleteMedicalHistory
);

export default router;
