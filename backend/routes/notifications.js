import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  markNotificationReadSchema,
  deleteNotificationSchema,
  updateAlertStatusSchema,
  updateTokenPreferencesSchema,
  registerPushTokenSchema,
  deletePushTokenSchema,
  sendTestNotificationSchema,
  sendNotificationToUserSchema,
  getNotificationHistorySchema,
} from '../schemas/notification.js';
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
router.post(
  '/token',
  authenticateToken,
  validateSchema(registerPushTokenSchema),
  registrarPushToken
);

router.delete(
  '/token',
  authenticateToken,
  validateSchema(deletePushTokenSchema),
  eliminarPushToken
);

// Alertas
router.get('/alertas', authenticateToken, obtenerAlertasActivas);
router.get('/banners', authenticateToken, obtenerBannersActivos);

router.patch(
  '/alertas/:id_alerta/estado',
  authenticateToken,
  validateSchema(updateAlertStatusSchema),
  actualizarEstadoAlerta
);

router.post(
  '/alertas/:id_alerta/reportar',
  authenticateToken,
  incrementarReportes
);

// Historial y estadísticas
router.get(
  '/historial',
  authenticateToken,
  validateSchema(getNotificationHistorySchema),
  obtenerHistorialNotificaciones
);

router.get(
  '/estadisticas',
  authenticateToken,
  obtenerEstadisticasNotificaciones
);

// DELETE /notifications/:id
router.delete(
  '/:id',
  authenticateToken,
  validateSchema(deleteNotificationSchema),
  borrarNotificacion
);

// Marcar una notificación como leída
router.patch(
  '/:id/read',
  authenticateToken,
  validateSchema(markNotificationReadSchema),
  marcarNotificacionLeida
);

// Marcar todas como leídas
router.patch('/read-all', authenticateToken, marcarTodasLeidas);

router.patch('/notifications/read-all', authenticateToken, marcarTodasLeidas);

// Testing
router.post(
  '/test',
  authenticateToken,
  validateSchema(sendTestNotificationSchema),
  enviarNotificacionPrueba
);

// Actualizar preferencias de notificación
router.patch(
  '/token/preferences',
  authenticateToken,
  validateSchema(updateTokenPreferencesSchema),
  actualizarPreferenciasToken
);

// Enviar notificaciones a usuarios específicos
router.post(
  '/send-to-user',
  authenticateToken,
  validateSchema(sendNotificationToUserSchema),
  //validateSchema(registerPushTokenSchema), 
  enviarNotificacionUsuario
);

export default router;
