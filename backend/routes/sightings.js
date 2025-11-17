import express from 'express';
import { 
  getSightings, 
  getSightingById, 
  createSighting, 
  updateSighting, 
  deleteSighting, 
  getSightingsByLocation, 
  filterSightings, 
  getEspecies, 
  getEstadosSalud, 
  getMySightings, 
  getEstadosAvistamiento 
} from '../controllers/sightingsController.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createSightingSchema,
  updateSightingSchema,
  getSightingByIdSchema,
  deleteSightingSchema,
  getAllSightingsSchema,
  getSightingsByLocationSchema,
} from '../schemas/sighting.js';

const router = express.Router();

// --- Rutas de lectura (GET) ---
// TODO: Estas rutas deberían estar en otro router 
// --- Rutas "extra" ---
router.get('/especies', getEspecies); 
router.get('/estados-salud', getEstadosSalud);
router.get('/estados-avistamiento', getEstadosAvistamiento);

// --- Rutas Especificas de SIGHTINGS ---
router.get(
  '/sightings/location',
  validateSchema(getSightingsByLocationSchema),
  getSightingsByLocation
);

router.get(
  '/sightings/filter',
  filterSightings
);

router.get(
  '/sightings/me',
  authenticateToken,
  getMySightings
);

// (Ruta: GET /api/sightings)
router.get(
  '/sightings',
  validateSchema(getAllSightingsSchema),
  getSightings
);

// (Ruta: GET /api/sightings/123)
router.get(
  '/sightings/:id',
  validateSchema(getSightingByIdSchema),
  getSightingById
);

// --- Rutas de Creación Actualización ---
router.post(
  '/sightings',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(createSightingSchema),
  createSighting
);

router.put(
  '/sightings/:id',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(updateSightingSchema),
  updateSighting
);

router.delete(
  '/sightings/:id',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(deleteSightingSchema),
  deleteSighting
);

export default router;