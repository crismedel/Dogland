import express from 'express';
import * as organizationsController from '../controllers/organizationsController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationByIdSchema,
  deleteOrganizationSchema,
  getAllOrganizationsSchema,
  getOrganizationUsersSchema
} from '../schemas/organization.js';

const router = express.Router();

// Rutas con validacion de Zod

// GET /api/organizations - Listar todas las organizaciones
router.get(
  '/organizations',
  validateSchema(getAllOrganizationsSchema),
  organizationsController.getAllOrganizations
);

// GET /api/organizations/:id - Obtener organización por ID
router.get(
  '/organizations/:id',
  validateSchema(getOrganizationByIdSchema),
  organizationsController.getOrganizationById
);

// POST /api/organizations - Crear nueva organización
router.post(
  '/organizations',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(createOrganizationSchema),
  organizationsController.createOrganization
);

// PUT /api/organizations/:id - Actualizar organización
router.put(
  '/organizations/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(updateOrganizationSchema),
  organizationsController.updateOrganization
);

// DELETE /api/organizations/:id - Eliminar organización
router.delete(
  '/organizations/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(deleteOrganizationSchema),
  organizationsController.deleteOrganization
);

// GET /api/organizations/:id/users - Usuarios de la org
router.get(
  '/organizations/:id/users',
  authenticateToken,
  authorizeRol(['Admin', 'Trabajador']),
  validateSchema(getOrganizationUsersSchema),
  organizationsController.getOrganizationUsers
);

export default router;
