import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
  registrarPushToken,
  eliminarPushToken,
  obtenerAlertasActivas,
  obtenerBannersActivos,
  actualizarEstadoAlerta,
  incrementarReportes,
  obtenerHistorialNotificaciones,
  enviarNotificacionPrueba,
  obtenerEstadisticasNotificaciones,
} from '../controllers/notificationsController.js';

const router = express.Router();

// Gestión de tokens
router.post('/token', authenticateToken, registrarPushToken);
router.delete('/token', authenticateToken, eliminarPushToken);

// Alertas
router.get('/alertas', authenticateToken, obtenerAlertasActivas);
router.get('/banners', authenticateToken, obtenerBannersActivos);
router.patch(
  '/alertas/:id_alerta/estado',
  authenticateToken,
  actualizarEstadoAlerta,
);
router.post(
  '/alertas/:id_alerta/reportar',
  authenticateToken,
  incrementarReportes,
);

// Historial y estadísticas
router.get('/historial', authenticateToken, obtenerHistorialNotificaciones);
router.get(
  '/estadisticas',
  authenticateToken,
  obtenerEstadisticasNotificaciones,
);

// Testing
router.post('/test', authenticateToken, enviarNotificacionPrueba);

export default router;
