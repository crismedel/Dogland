import express from 'express';
import passport from 'passport';
import { FRONTEND_URL } from '../config/env.js'; // para 'failureRedirect'
import { authenticateJWT } from '../middlewares/authenticateJWT.js';

// Importar los controladores
import {
  handleGoogleCallbackWeb,
  logoutWeb,
  getCurrentUserWeb,
  checkGoogleAccount,
  signInMobile,
  getCurrentUserMobile,
  logoutMobile,
  verifyTokenMobile,
  refreshUserDataMobile
} from '../controllers/authGoogleController.js';

const router = express.Router();

// --- RUTAS WEB (Sesiones con Passport) ---

// Ruta para iniciar la autenticacion con Google
router.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Ruta de callback despues de la autenticacion con Google
router.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    session: true // Asegúrate que sea 'true' para que 'req.user' se establezca
  }),
  handleGoogleCallbackWeb // Llama al controlador
);

// Ruta para cerrar sesion web
router.post('/logout', logoutWeb);

// Ruta para obtener el usuario actual (sesión web)
router.get('/current', getCurrentUserWeb);

// Ruta para verificar si un usuario tiene cuenta de Google vinculada
router.get('/check/:email', checkGoogleAccount);


// --- RUTAS MOVIL (React Native con JWT) ---

/**
 * Autenticacion con Google Sign-In nativo (para React Native)
 * Recibe el idToken de Google y retorna JWT
 */
router.post('/mobile/signin', signInMobile);

/**
 * Obtener informacion del usuario actual (usando JWT)
 * Header requerido: Authorization: Bearer <token>
 */
router.get('/mobile/me', authenticateJWT, getCurrentUserMobile);

/**
 * Cerrar sesion movil (invalidar token del lado del cliente)
 */
router.post('/mobile/logout', authenticateJWT, logoutMobile);

/**
 * Verificar si el token JWT es valido
 */
router.get('/mobile/verify', authenticateJWT, verifyTokenMobile);

/**
 * Refrescar informacion del usuario
 */
router.get('/mobile/refresh', authenticateJWT, refreshUserDataMobile);

export default router;
