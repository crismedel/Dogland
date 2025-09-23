import express from 'express';
import { getSightings, getSightingById, createSighting, updateSighting, deleteSighting } from '../controllers/sightingsController.js';

const router = express.Router();

// Ruta para obtener todos los avistamientos
router.get('/sightings', getSightings);

// Ruta para obtener un avistamiento por ID
router.get('/sightings/:id', getSightingById);

// Ruta para crear un nuevo avistamiento
router.post('/sightings', createSighting);

// Ruta para actualizar un avistamiento por ID
router.put('/sightings/:id', updateSighting);

// Ruta para eliminar un avistamiento por ID
router.delete('/sightings/:id', deleteSighting);

export default router;
