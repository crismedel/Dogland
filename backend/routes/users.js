import express from 'express';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { validateParams } from '../middlewares/validateParams.js';
import {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
  savePushTokenSchema
} from '../schemas/user.js';
import * as usersController from '../controllers/usersController.js';

const router = express.Router();

// GET /api/users - Listar todos los usuarios
router.get(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  usersController.listAllUsers
);

// GET /api/users/profile - Obtener datos del usuario logeado
router.get(
  '/users/profile',
  authenticateToken,
  usersController.getUserProfile
);

// GET /api/users/:id - Obtener usuario por ID
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateParams(paramsSchema),
  usersController.getUserById
);

// POST /api/users - Crear usuario
router.post(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(createUserSchema),
  usersController.createUser
);

// PUT /api/users/:id - Actualizar usuario
router.put(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(updateUserSchema),
  validateParams(paramsSchema),
  usersController.updateUser
);

// DELETE /api/users/:id - Borrar usuario
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateParams(paramsSchema),
  usersController.deleteUser
);

// PATCH /api/users/:id/deactivate - Desactivar usuario
router.patch(
  '/users/:id/deactivate',
  authenticateToken,
  authorizeRol(['Admin']),
  validateParams(paramsSchema),
  usersController.deactivateUser
);

// PATCH /api/users/:id/activate - Activar usuario
router.patch(
  '/users/:id/activate',
  authenticateToken,
  authorizeRol(['Admin']),
  validateParams(paramsSchema),
  usersController.activateUser
);

// POST /api/users/savePushToken - Guardar token push
router.post(
  '/users/savePushToken',
  authenticateToken,
  authorizeRol(['Admin', 'Usuario', 'Trabajador']),
  validateSchema(savePushTokenSchema),
  usersController.savePushToken
);

export default router;
