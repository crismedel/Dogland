import express from 'express';
import { 
  getAllMedicalHistory 
} from '../controllers/medicalHistoryController.js';

const router = express.Router();

// Rutas generales para administrador
// TODO: generar post patch delete
router.get('/medicalHistory', getAllMedicalHistory);

export default router;
