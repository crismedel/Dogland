import pool from '../db/db.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../services/auditService.js';
import { getOldValuesForAudit, sanitizeForAudit } from '../utils/audit.js';
import * as notificationService from '../services/notificationService.js';

// Obtiene todas las alertas activas, con latitud, longitud y dirección
export const getAlerts = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por,
             ST_Y(a.ubicacion::geometry) AS latitude,
             ST_X(a.ubicacion::geometry) AS longitude,
             a.direccion
      FROM alerta a
      INNER JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      INNER JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE a.activa = true
      ORDER BY a.fecha_creacion DESC
    `);
    // Devuelve las alertas encontradas junto con la cantidad total
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    // Pasa el error al siguiente middleware de manejo de errores
    next(error);
  }
};

// Obtiene una alerta específica por su ID, con latitud, longitud y dirección
export const getAlertById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por,
             ST_Y(a.ubicacion::geometry) AS latitude,
             ST_X(a.ubicacion::geometry) AS longitude,
             a.direccion
      FROM alerta a
      INNER JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      INNER JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE a.id_alerta = $1
    `,
      [req.params.id],
    );

    // Si no se encuentra la alerta, responde con error 404
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    // Devuelve la alerta encontrada
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Crea una nueva alerta con los datos proporcionados en el cuerpo de la solicitud
export const createAlert = async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      id_tipo_alerta,
      id_nivel_riesgo,
      latitude,
      longitude,
      direccion,
      fecha_expiracion,
    } = req.body;

    const id_usuario = req.user.id;

    if (
      !titulo ||
      !descripcion ||
      !id_tipo_alerta ||
      !id_nivel_riesgo ||
      !id_usuario
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Campos requeridos faltantes' });
    }

    let ubicacion = null;
    if (latitude != null && longitude != null) {
      ubicacion = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    const result = await pool.query(
      `
      INSERT INTO alerta (titulo, descripcion, id_tipo_alerta, id_nivel_riesgo, id_usuario, ubicacion, direccion, fecha_expiracion, activa, reportes) 
      VALUES ($1,$2,$3,$4,$5,ST_GeomFromText($6),$7,$8,true,0)
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        id_usuario,
        ubicacion,
        direccion,
        fecha_expiracion,
      ],
    );

    const alerta = result.rows[0];

    const alertaInfo = await pool.query(
      `SELECT ta.tipo_alerta, nr.nivel_riesgo, u.id_ciudad
       FROM alerta a
       JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
       JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
       JOIN usuario u ON a.id_usuario = u.id_usuario
       WHERE a.id_alerta = $1`,
      [alerta.id_alerta],
    );

    if (!alertaInfo || alertaInfo.rowCount === 0) {
      console.warn('createAlert: alertaInfo no disponible para notificaciones');
    } else {
      const { tipo_alerta, nivel_riesgo, id_ciudad } = alertaInfo.rows[0];

      try {
        let tokensQuery;
        let tokensParams;

        // Usar la tabla con schema dogland (según tu información)
        if (id_nivel_riesgo >= 3) {
          // Nivel alto: todos los tokens válidos de usuarios activos
          tokensQuery = `
            SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
            FROM dogland.user_push_tokens upt
            INNER JOIN dogland.usuario u ON upt.user_id = u.id_usuario
            WHERE u.activo = true
              AND upt.is_valid = true
              AND upt.push_token IS NOT NULL
              AND (upt.failure_count IS NULL OR upt.failure_count < 3)
          `;
          tokensParams = [];
        } else {
          // Nivel bajo/medio: usuarios de la misma ciudad
          tokensQuery = `
            SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
            FROM dogland.user_push_tokens upt
            INNER JOIN dogland.usuario u ON upt.user_id = u.id_usuario
            WHERE u.id_ciudad = $1
              AND u.activo = true
              AND upt.is_valid = true
              AND upt.push_token IS NOT NULL
              AND (upt.failure_count IS NULL OR upt.failure_count < 3)
          `;
          tokensParams = [id_ciudad];
        }

        const tokensRes = await pool.query(tokensQuery, tokensParams);

        // Deduplicar tokens por valor
        const tokenMap = new Map();
        for (const row of tokensRes.rows) {
          if (!row.push_token) continue;
          const token = row.push_token.toString().trim();
          if (!token) continue;
          if (!tokenMap.has(token)) {
            tokenMap.set(token, {
              token,
              platform: row.platform || null,
              device_id: row.device_id || `user_${row.user_id}`,
              user_id: row.user_id,
            });
          }
        }
        const entries = Array.from(tokenMap.values());

        if (entries.length > 0) {
          await sendPushNotificationToUsers(
            `🚨 ${tipo_alerta}: ${titulo}`,
            descripcion,
            entries,
            {
              type: 'alerta',
              id: alerta.id_alerta,
              nivel_riesgo: nivel_riesgo,
              tipo_alerta: tipo_alerta,
              ubicacion: direccion || '',
              latitude: latitude,
              longitude: longitude,
            },
          );
          console.log(
            `✅ Notificación de alerta enviada a ${entries.length} tokens (user_push_tokens)`,
          );
        } else {
          console.log('createAlert: no se encontraron tokens para notificar');
        }
      } catch (notifError) {
        console.error('⚠️ Error al enviar notificación de alerta:', notifError);
      }

      // 🔔 Guardar notificación en BD (dentro del mismo bloque)
      try {
        const usersToNotify = await pool.query(
          `SELECT DISTINCT upt.user_id
           FROM dogland.user_push_tokens upt
           INNER JOIN dogland.usuario u ON upt.user_id = u.id_usuario
           WHERE u.activo = true
             AND upt.is_valid = true
             AND upt.push_token IS NOT NULL
             AND (upt.failure_count IS NULL OR upt.failure_count < 3)
             ${id_nivel_riesgo >= 3 ? '' : 'AND u.id_ciudad = $1'}
          `,
          id_nivel_riesgo >= 3 ? [] : [id_ciudad],
        );

        const userIds = usersToNotify.rows.map((r) => r.user_id);
        const notificationPayload = {
          title: `🚨 ${tipo_alerta}: ${titulo}`,
          body: descripcion,
          type: 'alerta',
          data: {
            alertId: alerta.id_alerta,
            nivel_riesgo,
            tipo_alerta,
            latitude,
            longitude,
          },
        };

        try {
          // Intento estándar vía servicio
          await notificationService.createNotificationsBulk(
            userIds,
            notificationPayload,
          );
          console.log(
            `✅ Notificación guardada en BD para ${userIds.length} usuarios`,
          );
        } catch (err) {
          // Si falla por esquema (p. ej. columna 'metadata' no existe), hacemos fallback
          console.error(
            '⚠️ Error al guardar notificación en BD (service):',
            err,
          );

          // Fallback: intentar insertar directamente en la tabla notifications usando columna "data" (JSONB)
          // Nota: Ajusta las columnas si tu tabla difiere.
          if (
            err &&
            err.code === '42703' &&
            /metadata/i.test(err.message || '')
          ) {
            try {
              if (userIds.length > 0) {
                const insertPromises = userIds.map((uid) =>
                  pool.query(
                    `INSERT INTO notifications (user_id, title, body, type, data, read, created_at)
                     VALUES ($1, $2, $3, $4, $5, false, NOW())`,
                    [
                      uid,
                      notificationPayload.title,
                      notificationPayload.body,
                      notificationPayload.type,
                      notificationPayload.data,
                    ],
                  ),
                );
                await Promise.all(insertPromises);
                console.log(
                  `✅ Notificación guardada en BD (fallback) para ${userIds.length} usuarios`,
                );
              } else {
                console.log(
                  'createAlert: no hay userIds para fallback de guardado',
                );
              }
            } catch (fallbackErr) {
              console.error(
                '⚠️ Error en fallback al guardar notificaciones en BD:',
                fallbackErr,
              );
            }
          } else {
            // Si es otro error, solo lo logueamos (no rompemos el endpoint)
            console.error(
              'createAlert: error al crear notificaciones (no se intentó fallback):',
              err,
            );
          }
        }
      } catch (err) {
        console.error(
          '⚠️ Error al preparar lista de usuarios para guardar notificación en BD:',
          err,
        );
      }
    }

    res.status(201).json({
      success: true,
      data: alerta,
      notificacionesEnviadas: true,
    });
  } catch (error) {
    next(error);
  }
};

// Actualiza una alerta existente con los datos proporcionados; solo actualiza campos presentes
export const updateAlert = async (req, res, next) => {
  try {
    const {
      titulo,
      descripcion,
      id_tipo_alerta,
      id_nivel_riesgo,
      latitude,
      longitude,
      direccion,
      fecha_expiracion,
      activa,
    } = req.body;

    // Obtener valores antiguos ANTES de actualizar
    const oldAlert = await getOldValuesForAudit(
      'alerta',
      'id_alerta',
      req.params.id,
    );

    if (!oldAlert) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    let ubicacion = null;
    if (latitude != null && longitude != null) {
      ubicacion = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    // Actualiza la alerta usando COALESCE para mantener valores actuales si no se proporcionan nuevos
    const result = await pool.query(
      `
      UPDATE alerta
      SET titulo = COALESCE($1, titulo),
          descripcion = COALESCE($2, descripcion),
          id_tipo_alerta = COALESCE($3, id_tipo_alerta),
          id_nivel_riesgo = COALESCE($4, id_nivel_riesgo),
          ubicacion = COALESCE(ST_GeomFromText($5), ubicacion),
          direccion = COALESCE($6, direccion),
          fecha_expiracion = COALESCE($7, fecha_expiracion),
          activa = COALESCE($8, activa)
      WHERE id_alerta = $9
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        ubicacion,
        direccion,
        fecha_expiracion,
        activa,
        req.params.id,
      ],
    );
    const updatedAlert = result.rows[0];

    // Auditar actualizacion
    await auditUpdate(req, 'alerta', req.params.id, oldAlert, updatedAlert);

    // Devuelve la alerta actualizada
    res.json({ success: true, data: updatedAlert });
  } catch (error) {
    next(error);
  }
};

// Elimina una alerta por su ID
export const deleteAlert = async (req, res, next) => {
  try {
    // Obtener datos antes de eliminar
    const oldAlert = await getOldValuesForAudit(
      'alerta',
      'id_alerta',
      req.params.id,
    );

    if (!oldAlert) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    const result = await pool.query(
      'DELETE FROM alerta WHERE id_alerta = $1 RETURNING *',
      [req.params.id],
    );

    // Auditar eliminacion
    await auditDelete(req, 'alerta', req.params.id, oldAlert);

    // Confirma la eliminación exitosa
    res.json({ success: true, message: 'Alerta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
