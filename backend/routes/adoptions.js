import express from 'express';
import {
  getAdoptions,
  getAdoptionById,
  createAdoptionRequest,
  updateAdoptionRequest,
  deleteAdoptionRequest,
  getAvailableAdoptions,
  createAdoptionPost,
} from '../controllers/adoptionsController.js';

import { checkPermissions } from '../middlewares/permissions.js';
import { validateAdoption } from '../middlewares/validationAdoption.js';

const router = express.Router();

// RUTAS PARA SOLICITUDES DE ADOPCIÓN
router.get('/adoption-requests', getAdoptions); // Ver todas las solicitudes
router.get('/adoption-requests/:id', getAdoptionById); // Ver solicitud específica

router.post(
  '/adoption-requests',
  validateAdoption,
  checkPermissions('create_adoption'),
  createAdoptionRequest, // Crear solicitud de adopción
);

router.put(
  '/adoption-requests/:id',
  checkPermissions('update_adoption'),
  updateAdoptionRequest, // Actualizar estado de solicitud
);

router.delete(
  '/adoption-requests/:id',
  checkPermissions('delete_adoption'),
  deleteAdoptionRequest, // Eliminar solicitud
);

// RUTAS PARA PUBLICACIONES DE ADOPCIÓN
router.get('/adoptions', getAvailableAdoptions); // Ver adopciones disponibles

router.post(
  '/adoptions',
  checkPermissions('create_adoption_post'),
  createAdoptionPost, // Crear publicación de adopción
);

export default router;