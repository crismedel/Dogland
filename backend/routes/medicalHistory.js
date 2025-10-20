import express from 'express';
import { 
  createMedicalHistory,
  deleteMedicalHistory,
  getAllMedicalHistory,
  getAnimalMedicalHistory, 
  getMedicalHistoryDetail,
  updateMedicalHistory
} from '../controllers/medicalHistoryController.js';

const router = express.Router();

// Rutas generales para administrador
router.get('/medicalHistory', getAllMedicalHistory);
router.get('/medicalHistory/:animalId', getAnimalMedicalHistory);
router.get('/medicalHistory/:animalId/:historyId', getMedicalHistoryDetail);

router.post('/medicalHistory/:animalId', createMedicalHistory);

router.put('/medicalHistory/:animalId/:historyId', updateMedicalHistory);

router.delete('/medicalHistory/:animalId/:historyId', deleteMedicalHistory);

export default router;
