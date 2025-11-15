import { Expo } from 'expo-server-sdk';
import pool from '../db/db.js';
import * as pushTokens from '../services/pushTokens.js';
import * as pushService from '../services/pushService.js';
import * as notificationService from '../services/notificationService.js';

const expo = new Expo();

// -----------------------------
// Gestión de tokens
// -----------------------------
// Registrar token de push notification
export const registrarPushToken = async (req, res) => {
  try {
    const {
      push_token,
      platform = null,
      app_version = null,
      device_id = null,
      preferences = { marketing: true, system: true }, // Valor por defecto
    } = req.body;
    const id_usuario = req.user.id;

    if (!id_usuario || !push_token) {
      return res
        .status(400)
        .json({ success: false, error: 'push_token es requerido' });
    }

    // Si tu app usa Expo tokens exclusivamente, validar; si no, puedes omitir
    if (!Expo.isExpoPushToken(push_token)) {
      return res
        .status(400)
        .json({ success: false, error: 'Token de Expo inválido' });
    }

    await pushTokens.upsertToken({
      user_id: id_usuario,
      push_token,
      platform,
      app_version,
      device_id,
      preferences, // Incluir preferencias
    });

    res.json({ success: true, message: 'Token registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar token:', error);
    res.status(500).json({ success: false, error: 'Error al registrar token' });
  }
};

// Eliminar token de push notification (logout)
export const eliminarPushToken = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { push_token } = req.body;

    if (push_token) {
      const deleted = await pushTokens.deleteToken(id_usuario, push_token);
      return res.json({
        success: true,
        message: 'Token eliminado correctamente',
        deleted,
      });
    } else {
      const deletedCount = await pushTokens.deleteAllTokens(id_usuario);
      return res.json({
        success: true,
        message: 'Todos los tokens eliminados correctamente',
        deletedCount,
      });
    }
  } catch (error) {
    console.error('Error al eliminar token:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar token' });
  }
};

export const enviarNotificacionPrueba = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const result = await pool.query(
      'SELECT push_token, preferences FROM user_push_tokens WHERE user_id = $1 AND is_valid = TRUE',
      [id_usuario],
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró token de notificación para este usuario',
      });
    }

    const tokensWithMeta = result.rows.map((r) => ({
      push_token: r.push_token,
      user_id: id_usuario,
      preferences: r.preferences,
    }));

    const sendResult = await pushService.sendPushNotificationToTokens(
      {
        title: '🔔 Notificación de Prueba',
        body: 'Tu sistema de notificaciones está funcionando correctamente',
        data: { type: 'test', timestamp: new Date().toISOString() },
      },
      tokensWithMeta,
    );

    res.json({
      success: true,
      message: 'Notificación de prueba enviada',
      sendResult,
    });
  } catch (error) {
    console.error('Error al enviar notificación de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación de prueba',
    });
  }
};

// -----------------------------
// Alertas / banners / historial / estadísticas
// -----------------------------

export const obtenerAlertasActivas = async (req, res) => {
  try {
    const { id_ciudad, limit = 20 } = req.query;

    let query = `
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.activa, a.reportes,
             ta.tipo_alerta, nr.nivel_riesgo, nr.id_nivel_riesgo,
             u.nombre_usuario, u.id_ciudad, c.nombre_ciudad,
             ST_Y(a.ubicacion::geometry) AS latitude,
             ST_X(a.ubicacion::geometry) AS longitude,
             a.direccion
      FROM alerta a
      JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      JOIN usuario u ON a.id_usuario = u.id_usuario
      LEFT JOIN ciudad c ON u.id_ciudad = c.id_ciudad
      WHERE a.activa = true
      AND (a.fecha_expiracion IS NULL OR a.fecha_expiracion > NOW())
    `;

    const params = [];
    let paramCount = 1;

    if (id_ciudad) {
      query += ` AND (nr.id_nivel_riesgo >= 3 OR u.id_ciudad = $${paramCount})`;
      params.push(id_ciudad);
      paramCount++;
    }

    query += ` ORDER BY nr.id_nivel_riesgo DESC, a.fecha_creacion DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener alertas',
    });
  }
};

// Obtener banners activos para mostrar en la app
export const obtenerBannersActivos = async (req, res) => {
  try {
    const { id_ciudad } = req.query;

    let query = `
      SELECT a.id_alerta as id, 
             CASE 
               WHEN nr.id_nivel_riesgo >= 4 THEN 'danger'
               WHEN nr.id_nivel_riesgo = 3 THEN 'warning'
               WHEN nr.id_nivel_riesgo = 2 THEN 'info'
               ELSE 'success'
             END as tipo,
             a.titulo,
             a.descripcion as mensaje,
             ST_Y(a.ubicacion::geometry) AS latitude,
             ST_X(a.ubicacion::geometry) AS longitude,
             a.direccion,
             a.activa as activo,
             nr.id_nivel_riesgo as prioridad,
             ta.tipo_alerta,
             c.nombre_ciudad
      FROM alerta a
      JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      JOIN usuario u ON a.id_usuario = u.id_usuario
      LEFT JOIN ciudad c ON u.id_ciudad = c.id_ciudad
      WHERE a.activa = true
      AND (a.fecha_expiracion IS NULL OR a.fecha_expiracion > NOW())
    `;

    const params = [];
    if (id_ciudad) {
      query += ` AND (nr.id_nivel_riesgo >= 3 OR u.id_ciudad = $1)`;
      params.push(id_ciudad);
    }

    query += ` ORDER BY nr.id_nivel_riesgo DESC, a.fecha_creacion DESC LIMIT 5`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener banners:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener banners',
    });
  }
};

// Actualizar estado de alerta (activar/desactivar)
export const actualizarEstadoAlerta = async (req, res) => {
  try {
    const { id_alerta } = req.params;
    const { activa } = req.body;

    if (typeof activa !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'El campo activa debe ser booleano',
      });
    }

    const result = await pool.query(
      `UPDATE alerta 
       SET activa = $1 
       WHERE id_alerta = $2
       RETURNING *`,
      [activa, id_alerta],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Estado de alerta actualizado',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar alerta',
    });
  }
};

// Incrementar reportes de alerta
export const incrementarReportes = async (req, res) => {
  try {
    const { id_alerta } = req.params;

    const result = await pool.query(
      `UPDATE alerta 
       SET reportes = reportes + 1 
       WHERE id_alerta = $1
       RETURNING *`,
      [id_alerta],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Reporte registrado',
      reportes: result.rows[0].reportes,
    });
  } catch (error) {
    console.error('Error al incrementar reportes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al incrementar reportes',
    });
  }
};

// Obtener historial de notificaciones de un usuario
export const obtenerHistorialNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { limit = 50, offset = 0, read = null } = req.query;

    const notifications = await notificationService.getNotificationsByUser(
      id_usuario,
      {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        read: read === 'true' ? true : read === 'false' ? false : null,
      },
    );

    // Obtener total para paginación
    let countQuery = `SELECT COUNT(*) FROM notifications WHERE user_id = $1`;
    const countParams = [id_usuario];
    if (read !== null) {
      countQuery += ` AND read = $2`;
      countParams.push(read === 'true');
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        total,
      },
    });
  } catch (err) {
    console.error('Error al obtener historial (notifications):', err);
    res
      .status(500)
      .json({ success: false, error: 'Error al obtener historial' });
  }
};

export const obtenerEstadisticasNotificaciones = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const stats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE a.activa = true) as alertas_activas,
        COUNT(*) FILTER (WHERE a.activa = false) as alertas_inactivas,
        COUNT(*) FILTER (WHERE nr.id_nivel_riesgo >= 3) as alertas_alta_prioridad,
        COUNT(DISTINCT ta.id_tipo_alerta) as tipos_alerta,
        MAX(a.fecha_creacion) as ultima_alerta
       FROM alerta a
       JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
       JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
       JOIN usuario u ON a.id_usuario = u.id_usuario
       WHERE u.id_ciudad = (SELECT id_ciudad FROM usuario WHERE id_usuario = $1)
       OR nr.id_nivel_riesgo >= 3`,
      [id_usuario],
    );

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
    });
  }
};

// Marcar notificación como leída
export const marcarNotificacionLeida = async (req, res) => {
  try {
    const id_usuario = req.user?.id;
    const { id } = req.params;
    console.info(
      '[marcarNotificacionLeida] req.user=',
      JSON.stringify(req.user),
      'idParam=',
      id,
    );

    const updated = await notificationService.markAsRead(
      parseInt(id, 10),
      id_usuario,
    );
    if (!updated) {
      console.warn(
        '[marcarNotificacionLeida] notificación no encontrada o no pertenece al usuario. id=%s user=%s',
        id,
        id_usuario,
      );
      return res
        .status(404)
        .json({ success: false, error: 'Notificación no encontrada' });
    }
    return res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: updated,
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error al marcar notificación' });
  }
};

export const marcarTodasLeidas = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const updated = await notificationService.markAllAsRead(id_usuario);
    res.json({
      success: true,
      message: `${updated.length} notificaciones marcadas como leídas`,
      data: updated,
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error al marcar notificaciones' });
  }
};

// Borrar notificación
export const borrarNotificacion = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id } = req.params; // route: /notifications/:id

    if (notificationService.deleteNotification) {
      const deleted = await notificationService.deleteNotification(
        parseInt(id, 10),
        id_usuario,
      );
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: 'Notificación no encontrada' });
      }
      return res.json({
        success: true,
        message: 'Notificación borrada',
        data: deleted,
      });
    }

    // Fallback direct query
    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, id_usuario],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Notificación no encontrada' });
    }

    res.json({
      success: true,
      message: 'Notificación borrada',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error al borrar notificación:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error al borrar notificación' });
  }
};

export const enviarNotificacionUsuario = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    const result = await pushService.sendPushNotificationToUsers(
      { title, body, data },
      [userId],
    );

    res.json({
      success: true,
      message: 'Notificación enviada',
      result,
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación',
    });
  }
};

// Actualizar preferencias de token de push notification
export const actualizarPreferenciasToken = async (req, res) => {
  try {
    const { push_token, preferences } = req.body;
    const id_usuario = req.user.id;

    if (!id_usuario || !push_token || !preferences) {
      return res.status(400).json({
        success: false,
        error: 'push_token y preferences son requeridos',
      });
    }

    await pushTokens.updateTokenPreferences({
      user_id: id_usuario,
      push_token,
      preferences,
    });

    res.json({
      success: true,
      message: 'Preferencias actualizadas correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error al actualizar preferencias' });
  }
};

// Export default (compatibilidad)
export default {
  registrarPushToken,
  eliminarPushToken,
  enviarNotificacionPrueba,
  obtenerAlertasActivas,
  obtenerBannersActivos,
  actualizarEstadoAlerta,
  incrementarReportes,
  obtenerHistorialNotificaciones,
  obtenerEstadisticasNotificaciones,
  marcarNotificacionLeida,
  borrarNotificacion,
  actualizarPreferenciasToken,
};
