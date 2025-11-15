import express from 'express';
import {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
} from '../controllers/alertsController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createAlertSchema,
  updateAlertSchema,
  getAlertByIdSchema,
  deleteAlertSchema,
  getAllAlertsSchema,
} from '../schemas/alert.js';
import { checkPermissions } from '../middlewares/permissions.js';
const router = express.Router();

// Ruta para obtener todas las alertas activas
router.get(
  '/alerts',
  validateSchema(getAllAlertsSchema),
  getAlerts
);

// Ruta para obtener una alerta específica por ID
router.get(
  '/alerts/:id',
  validateSchema(getAlertByIdSchema),
  getAlertById
);

// Ruta para crear una nueva alerta, con validación y control de permisos
router.post(
  '/alerts',
  authenticateToken,
  validateSchema(createAlertSchema),
  checkPermissions('create_alert'),
  createAlert
);

// Ruta para actualizar una alerta existente, con validación y control de permisos
router.put(
  '/alerts/:id',
  authenticateToken,
  validateSchema(updateAlertSchema),
  checkPermissions('update_alert'),
  updateAlert
);

// Ruta para eliminar una alerta, con control de permisos
router.delete(
  '/alerts/:id',
  authenticateToken,
  validateSchema(deleteAlertSchema),
  checkPermissions('delete_alert'),
  deleteAlert
);

router.post('/test-push-notification', async (req, res, next) => {
  try {
    const { message, userIds } = req.body; // Esperamos un mensaje y una lista de IDs de usuario

    if (
      !message ||
      !userIds ||
      !Array.isArray(userIds) ||
      userIds.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Faltan message o userIds válidos' });
    }

    await sendPushNotificationToUsers(message, userIds);
    res.json({ success: true, message: 'Notificación de prueba enviada' });
  } catch (error) {
    console.error('Error en ruta de prueba de notificación:', error);
    next(error);
  }
});

export default router;
