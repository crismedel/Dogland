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

import { authenticateToken } from '../middlewares/auth.js';
import { checkPermissions } from '../middlewares/permissions.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createAdoptionRequestSchema,
  updateAdoptionRequestSchema,
  getAdoptionRequestByIdSchema,
  deleteAdoptionRequestSchema,
  getAllAdoptionRequestsSchema,
} from '../schemas/adoption.js';

const router = express.Router();

// RUTAS PARA SOLICITUDES DE ADOPCIÓN
router.get(
  '/adoption-requests',
  validateSchema(getAllAdoptionRequestsSchema),
  getAdoptions
);

router.get(
  '/adoption-requests/:id',
  validateSchema(getAdoptionRequestByIdSchema),
  getAdoptionById
);

router.post(
  '/adoption-requests',
  authenticateToken,
  validateSchema(createAdoptionRequestSchema),
  checkPermissions('create_adoption'),
  createAdoptionRequest
);

router.put(
  '/adoption-requests/:id',
  authenticateToken,
  validateSchema(updateAdoptionRequestSchema),
  checkPermissions('update_adoption'),
  updateAdoptionRequest
);

router.delete(
  '/adoption-requests/:id',
  authenticateToken,
  validateSchema(deleteAdoptionRequestSchema),
  checkPermissions('delete_adoption'),
  deleteAdoptionRequest
);

// RUTAS PARA PUBLICACIONES DE ADOPCIÓN
router.get('/adoptions', getAvailableAdoptions); // Ver adopciones disponibles

router.post(
  '/adoptions',
  authenticateToken,
  checkPermissions('create_adoption_post'),
  createAdoptionPost, // Crear publicación de adopción
);

export default router;