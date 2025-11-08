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
  marcarNotificacionLeida,
  borrarNotificacion,
  marcarTodasLeidas,
  enviarNotificacionUsuario,
  actualizarPreferenciasToken,
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

// DELETE /notifications/:id
router.delete('/:id', authenticateToken, borrarNotificacion);

// Marcar una notificación como leída (corregida)
router.patch('/:id/read', authenticateToken, marcarNotificacionLeida);

// Marcar todas como leídas (ruta relativa al router)
router.patch('/read-all', authenticateToken, marcarTodasLeidas);

router.patch('/notifications/read-all', authenticateToken, marcarTodasLeidas);
// Testing
router.post('/test', authenticateToken, enviarNotificacionPrueba);

// Actualizar preferencias de notificación
router.patch(
  '/token/preferences',
  authenticateToken,
  actualizarPreferenciasToken,
);
// Nuevo endpoint para enviar notificaciones a usuarios específicos
router.post('/send-to-user', authenticateToken, enviarNotificacionUsuario); // Agregar

export default router;
