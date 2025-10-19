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
import { validateAlert } from '../middlewares/validationAlert.js';
import { checkPermissions } from '../middlewares/permissions.js';
const router = express.Router();

// Ruta para obtener todas las alertas activas
router.get('/alerts', getAlerts);

// Ruta para obtener una alerta específica por ID
router.get('/alerts/:id', getAlertById);

// Ruta para crear una nueva alerta, con validación y control de permisos
router.post(
  '/alerts',
  authenticateToken,
  validateAlert, // Valida los datos de la alerta
  checkPermissions('create_alert'), // Verifica permisos para crear alertas
  createAlert, // Controlador que crea la alerta
);

// Ruta para actualizar una alerta existente, con validación y control de permisos
router.put(
  '/alerts/:id',
  authenticateToken,
  validateAlert, // Valida los datos de la alerta
  checkPermissions('update_alert'), // Verifica permisos para actualizar alertas
  updateAlert, // Controlador que actualiza la alerta
);

// Ruta para eliminar una alerta, con control de permisos
router.delete(
  '/alerts/:id',
  authenticateToken,
  checkPermissions('delete_alert'), // Verifica permisos para eliminar alertas
  deleteAlert, // Controlador que elimina la alerta
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
