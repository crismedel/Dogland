import express from 'express';
import {
  createMedicalHistory,
  deleteMedicalHistory,
  getAllMedicalHistory,
  getAnimalMedicalHistory,
  getMedicalHistoryDetail,
  updateMedicalHistory
} from '../controllers/medicalHistoryController.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createMedicalHistorySchema,
  updateMedicalHistorySchema,
  getMedicalHistoryByAnimalSchema,
  getMedicalHistoryDetailSchema,
  deleteMedicalHistorySchema,
  getAllMedicalHistorySchema,
} from '../schemas/medicalHistory.js';

const router = express.Router();

// Rutas generales para administrador
router.get(
  '/medicalHistory',
  validateSchema(getAllMedicalHistorySchema),
  getAllMedicalHistory
);

router.get(
  '/medicalHistory/:animalId',
  validateSchema(getMedicalHistoryByAnimalSchema),
  getAnimalMedicalHistory
);

router.get(
  '/medicalHistory/:animalId/:historyId',
  validateSchema(getMedicalHistoryDetailSchema),
  getMedicalHistoryDetail
);

router.post(
  '/medicalHistory/:animalId',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(createMedicalHistorySchema),
  createMedicalHistory
);

router.put(
  '/medicalHistory/:animalId/:historyId',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(updateMedicalHistorySchema),
  updateMedicalHistory
);

router.delete(
  '/medicalHistory/:animalId/:historyId',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(deleteMedicalHistorySchema),
  deleteMedicalHistory
);

export default router;
