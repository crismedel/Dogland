import express from 'express';
import { getSightings, getSightingById, createSighting, updateSighting, deleteSighting, getSightingsByLocation, filterSightings, getEspecies, getEstadosSalud, getMySightings, getEstadosAvistamiento, closeSighting } from '../controllers/sightingsController.js';
import { authenticateToken} from '../middlewares/auth.js'; // Importa el middleware de autenticación

const router = express.Router();

// --- Rutas de lectura (GET) - De más específicas a más generales ---
// Rutas con nombres específicos (no son dinámicas)
router.get('/sightings/location', getSightingsByLocation);
router.get('/sightings/filter', filterSightings);
router.get('/especies', getEspecies); 
router.get('/estados-salud', getEstadosSalud);
router.get('/estados-avistamiento', getEstadosAvistamiento);


// Esta debe ir antes de /sightings/:id para evitar conflictos,
// pero como el endpoint es /sightings/me, la ponemos aquí.
router.get('/sightings/me', authenticateToken, getMySightings);
// Rutas con IDs dinámicos
router.get('/sightings/:id', getSightingById);

router.patch('/sightings/:id/close', authenticateToken, closeSighting);
// Rutas generales
router.get('/sightings', getSightings);

// --- Rutas de escritura protegidas por autenticación ---
// Añade el middleware `authenticateToken` para proteger estas rutas
router.post('/sightings', authenticateToken, createSighting);
router.put('/sightings/:id', authenticateToken, updateSighting);
router.delete('/sightings/:id', authenticateToken, deleteSighting);


export default router;