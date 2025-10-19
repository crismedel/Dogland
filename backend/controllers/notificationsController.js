import { Expo } from 'expo-server-sdk';
import pool from '../db/db.js';

const expo = new Expo();

// ============================================
// FUNCIÓN AUXILIAR PARA ENVIAR NOTIFICACIONES
// ============================================
async function enviarPushNotifications(tokens, notification) {
  const messages = [];

  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`❌ Token inválido: ${token}`);
      continue;
    }

    messages.push({
      to: token,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data,
      priority: 'high',
      badge: 1,
      channelId: 'default',
    });
  }

  if (messages.length === 0) {
    console.log('⚠️ No hay mensajes válidos para enviar');
    return [];
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
      console.log(`✅ Enviadas ${ticketChunk.length} notificaciones`);
    } catch (error) {
      console.error('❌ Error enviando chunk de notificaciones:', error);
    }
  }

  return tickets;
}

// ============================================
// CONTROLADOR DE NOTIFICACIONES
// ============================================

// Registrar token de push notification
export const registrarPushToken = async (req, res) => {
  try {
    const { push_token } = req.body;
    const id_usuario = req.user.id; // Desde el middleware de autenticación

    if (!id_usuario || !push_token) {
      return res.status(400).json({
        success: false,
        error: 'push_token es requerido',
      });
    }

    // Validar que el token sea válido
    if (!Expo.isExpoPushToken(push_token)) {
      return res.status(400).json({
        success: false,
        error: 'Token de Expo inválido',
      });
    }

    await pool.query(
      `UPDATE usuario 
       SET push_token = $1 
       WHERE id_usuario = $2`,
      [push_token, id_usuario],
    );

    res.json({
      success: true,
      message: 'Token registrado correctamente',
    });
  } catch (error) {
    console.error('Error al registrar token:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar token',
    });
  }
};

// Eliminar token de push notification (logout)
export const eliminarPushToken = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    await pool.query(
      `UPDATE usuario 
       SET push_token = NULL 
       WHERE id_usuario = $1`,
      [id_usuario],
    );

    res.json({
      success: true,
      message: 'Token eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar token:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar token',
    });
  }
};

// Obtener alertas activas
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
    const { limit = 50, offset = 0 } = req.query;

    // Obtener ciudad del usuario
    const userResult = await pool.query(
      'SELECT id_ciudad FROM usuario WHERE id_usuario = $1',
      [id_usuario],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const { id_ciudad } = userResult.rows[0];

    // Obtener alertas relevantes para el usuario
    const result = await pool.query(
      `SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion,
              a.fecha_expiracion, a.activa, a.reportes,
              ta.tipo_alerta, nr.nivel_riesgo, nr.id_nivel_riesgo,
              u.nombre_usuario, c.nombre_ciudad,
              ST_Y(a.ubicacion::geometry) AS latitude,
              ST_X(a.ubicacion::geometry) AS longitude,
              a.direccion
       FROM alerta a
       JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
       JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
       JOIN usuario u ON a.id_usuario = u.id_usuario
       LEFT JOIN ciudad c ON u.id_ciudad = c.id_ciudad
       WHERE (nr.id_nivel_riesgo >= 3 OR u.id_ciudad = $1)
       ORDER BY a.fecha_creacion DESC
       LIMIT $2 OFFSET $3`,
      [id_ciudad, limit, offset],
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial',
    });
  }
};

// Enviar notificación de prueba
export const enviarNotificacionPrueba = async (req, res) => {
  try {
    const id_usuario = req.user.id;

    const userResult = await pool.query(
      'SELECT push_token FROM usuario WHERE id_usuario = $1',
      [id_usuario],
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].push_token) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró token de notificación para este usuario',
      });
    }

    const { push_token } = userResult.rows[0];

    if (!Expo.isExpoPushToken(push_token)) {
      return res.status(400).json({
        success: false,
        error: 'Token de Expo inválido',
      });
    }

    const tickets = await enviarPushNotifications([push_token], {
      title: '🔔 Notificación de Prueba',
      body: 'Tu sistema de notificaciones está funcionando correctamente',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      message: 'Notificación de prueba enviada',
      tickets: tickets.length,
    });
  } catch (error) {
    console.error('Error al enviar notificación de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación de prueba',
    });
  }
};

// Obtener estadísticas de notificaciones
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

export default {
  registrarPushToken,
  eliminarPushToken,
  obtenerAlertasActivas,
  obtenerBannersActivos,
  actualizarEstadoAlerta,
  incrementarReportes,
  obtenerHistorialNotificaciones,
  enviarNotificacionPrueba,
  obtenerEstadisticasNotificaciones,
};
