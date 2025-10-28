import express from 'express';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
  getAllUsersSchema,
  savePushTokenSchema,
} from '../schemas/user.js';
import * as usersController from '../controllers/usersController.js';

const router = express.Router();

/**
 * GET /api/users - Listar todos los usuarios
 * Requiere autenticacion y rol de Admin
 */
router.get(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(getAllUsersSchema),
  usersController.listAllUsers,
);

/**
 * GET /api/users/profile - Obtener datos del usuario logeado
 * Requiere autenticacion
 */
router.get('/users/profile', authenticateToken, usersController.getUserProfile);

router.put(
  '/users/profile',
  authenticateToken,
  usersController.updateOwnProfile,
);

/**
 * GET /api/users/:id - Obtener usuario por ID
 * Requiere autenticacion y rol de Admin
 */
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(getUserByIdSchema),
  usersController.getUserById,
);

/**
 * POST /api/users - Crear usuario
 * Requiere autenticacion y rol de Admin
 */
router.post(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(createUserSchema),
  usersController.createUser,
);

/**
 * PUT /api/users/:id - Actualizar usuario
 * Requiere autenticacion y rol de Admin
 */
router.put(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(updateUserSchema),
  usersController.updateUser,
);

/**
 * DELETE /api/users/:id - Borrar usuario
 * Requiere autenticacion y rol de Admin
 */
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(deleteUserSchema),
  usersController.deleteUser,
);

/**
 * PATCH /api/users/:id/deactivate - Desactivar usuario
 * Requiere autenticacion y rol de Admin
 */
router.patch(
  '/users/:id/deactivate',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(getUserByIdSchema),
  usersController.deactivateUser,
);

/**
 * PATCH /api/users/:id/activate - Activar usuario
 * Requiere autenticacion y rol de Admin
 */
router.patch(
  '/users/:id/activate',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(getUserByIdSchema),
  usersController.activateUser,
);

/**
 * POST /api/users/:id/push-token - Guardar token push
 * Requiere autenticacion
 */
router.post(
  '/users/savePushToken',
  authenticateToken,
  authorizeRol(['Admin', 'Usuario', 'Trabajador']),
  validateSchema(savePushTokenSchema),
  usersController.savePushToken,
);

export default router;
