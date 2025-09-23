import express from 'express';
import { getSightings, getSightingById, createSighting, updateSighting, deleteSighting, getSightingsByLocation, filterSightings } from '../controllers/sightingsController.js';

const router = express.Router();
//se cambia orden de rutas para ir de rutas especificas a rutas mas generales para que no haya conflictos
router.get('/sightings/location', getSightingsByLocation);
router.get('/sightings/filter', filterSightings);
router.get('/sightings/:id', getSightingById);
router.get('/sightings', getSightings);
router.post('/sightings', createSighting);
router.put('/sightings/:id', updateSighting);
router.delete('/sightings/:id', deleteSighting);
export default router;