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

import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(createAdoptionRequestSchema),
  createAdoptionRequest
);

router.put(
  '/adoption-requests/:id',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(updateAdoptionRequestSchema),
  updateAdoptionRequest
);

router.delete(
  '/adoption-requests/:id',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(deleteAdoptionRequestSchema),
  deleteAdoptionRequest
);

// RUTAS PARA PUBLICACIONES DE ADOPCIÓN
router.get('/adoptions', getAvailableAdoptions); // Ver adopciones disponibles

router.post(
  '/adoptions',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  createAdoptionPost, // Crear publicación de adopción
);

export default router;