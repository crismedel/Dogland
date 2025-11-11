import express from 'express';
import {
  createMedicalHistory,
  deleteMedicalHistory,
  getAllMedicalHistory,
  getAnimalMedicalHistory,
  getMedicalHistoryDetail,
  updateMedicalHistory
} from '../controllers/medicalHistoryController.js';
import { authenticateToken } from '../middlewares/auth.js';
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
  validateSchema(createMedicalHistorySchema),
  createMedicalHistory
);

router.put(
  '/medicalHistory/:animalId/:historyId',
  authenticateToken,
  validateSchema(updateMedicalHistorySchema),
  updateMedicalHistory
);

router.delete(
  '/medicalHistory/:animalId/:historyId',
  authenticateToken,
  validateSchema(deleteMedicalHistorySchema),
  deleteMedicalHistory
);

export default router;
