import express from 'express';
import {
  getProfilePhoto,
  getProfilePhotoFile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../controllers/userPhotoController.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import {
  uploadProfileMemory,
  processProfileImage,
} from '../middlewares/uploadProfileImage.js';

const router = express.Router();

// Metadatos de la foto de perfil (no binario)
router.get(
  '/user/profile-image/:userId',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  getProfilePhoto,
);

// Hacer pública la ruta del binario (sin authenticateToken)
router.get('/user/profile-image/:userId/file', getProfilePhotoFile);

// Subir/actualizar foto de perfil (guarda en BD como blob)
router.post(
  '/user/profile-image/upload/:userId',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  uploadProfileMemory.single('image'),
  processProfileImage,
  uploadProfilePhoto,
);

// Eliminar foto de perfil (borra blob en BD)
router.delete(
  '/user/profile-image/:userId',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  deleteProfilePhoto,
);

export default router;
