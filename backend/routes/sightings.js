import express from 'express';
import { getSightings, getSightingById, createSighting, updateSighting, deleteSighting, getSightingsByLocation, filterSightings, getEspecies, getEstadosSalud } from '../controllers/sightingsController.js';

const router = express.Router();
//se cambia orden de rutas para ir de rutas especificas a rutas mas generales para que no haya conflictos
// Rutas específicas primero
router.get('/sightings/location', getSightingsByLocation);
router.get('/sightings/filter', filterSightings);
router.get('/sightings/:id', getSightingById);

// Rutas generales después
router.get('/sightings', getSightings);
router.get('/especies', getEspecies); 
router.get('/estados-salud', getEstadosSalud);

// Rutas de escritura
router.post('/sightings', createSighting);
router.put('/sightings/:id', updateSighting);
router.delete('/sightings/:id', deleteSighting);
export default router;