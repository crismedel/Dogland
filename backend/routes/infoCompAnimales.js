// routes/infoCompAnimales.js
import express from 'express';
import { getFullAnimals } from '../controllers/animalFullController.js';

const router = express.Router();

// 🔹 Endpoint para obtener toda la información completa de los animales
router.get('/animals/full', getFullAnimals);

export default router;
