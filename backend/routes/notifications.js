import express from 'express';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
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
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(registerPushTokenSchema),
  registrarPushToken
);

router.delete(
  '/token',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(deletePushTokenSchema),
  eliminarPushToken
);

// Alertas
router.get(
  '/alertas',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  obtenerAlertasActivas
);
router.get(
  '/banners',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  obtenerBannersActivos
);

router.patch(
  '/alertas/:id_alerta/estado',
  authenticateToken,
  authorizeRol(['Trabajador', 'Admin']),
  validateSchema(updateAlertStatusSchema),
  actualizarEstadoAlerta
);

router.post(
  '/alertas/:id_alerta/reportar',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  incrementarReportes
);

// Historial y estadísticas
router.get(
  '/historial',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(getNotificationHistorySchema),
  obtenerHistorialNotificaciones
);

router.get(
  '/estadisticas',
  authenticateToken,
  authorizeRol(['Admin']),
  obtenerEstadisticasNotificaciones
);

// DELETE /notifications/:id
router.delete(
  '/:id',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(deleteNotificationSchema),
  borrarNotificacion
);

// Marcar una notificación como leída
router.patch(
  '/:id/read',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(markNotificationReadSchema),
  marcarNotificacionLeida
);

// Marcar todas como leídas
router.patch(
  '/read-all',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  marcarTodasLeidas
);

router.patch(
  '/notifications/read-all',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  marcarTodasLeidas
);

// Testing
router.post(
  '/test',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(sendTestNotificationSchema),
  enviarNotificacionPrueba
);

// Actualizar preferencias de notificación
router.patch(
  '/token/preferences',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  validateSchema(updateTokenPreferencesSchema),
  actualizarPreferenciasToken
);

// Enviar notificaciones a usuarios específicos
router.post(
  '/send-to-user',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(sendNotificationToUserSchema),
  //validateSchema(registerPushTokenSchema),
  enviarNotificacionUsuario
);

export default router;
