import pool from '../db/db.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../services/auditService.js';
import { getOldValuesForAudit, sanitizeForAudit } from '../utils/audit.js';
import * as notificationService from '../services/notificationService.js';

// Todas las solicitudes de adopción
export const getAdoptions = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT sa.id_solicitud_adopcion, sa.fecha_ingreso_solicitud, sa.fecha_termino_solicitud,
             es.estado_solicitud,
             a.nombre_animal, a.edad_animal, a.edad_aproximada,
             u.nombre_usuario AS solicitante,
             ur.nombre_usuario AS rescatista,
             ad.descripcion, ad.fecha_publicacion, ad.disponible
      FROM solicitud_adopcion sa
      INNER JOIN adopcion ad ON sa.id_adopcion = ad.id_adopcion
      INNER JOIN animal a ON ad.id_animal = a.id_animal
      INNER JOIN usuario u ON sa.id_usuario = u.id_usuario
      INNER JOIN usuario ur ON ad.id_usuario_rescatista = ur.id_usuario
      INNER JOIN estado_solicitud es ON sa.id_estado_solicitud = es.id_estado_solicitud
      ORDER BY sa.fecha_ingreso_solicitud DESC
    `);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// Una solicitud por ID
export const getAdoptionById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT sa.id_solicitud_adopcion, sa.fecha_ingreso_solicitud, sa.fecha_termino_solicitud,
             es.estado_solicitud,
             a.nombre_animal, a.edad_animal, a.edad_aproximada,
             u.nombre_usuario AS solicitante, u.email AS email_solicitante,
             ur.nombre_usuario AS rescatista, ur.email AS email_rescatista,
             ad.descripcion, ad.fecha_publicacion, ad.disponible
      FROM solicitud_adopcion sa
      INNER JOIN adopcion ad ON sa.id_adopcion = ad.id_adopcion
      INNER JOIN animal a ON ad.id_animal = a.id_animal
      INNER JOIN usuario u ON sa.id_usuario = u.id_usuario
      INNER JOIN usuario ur ON ad.id_usuario_rescatista = ur.id_usuario
      INNER JOIN estado_solicitud es ON sa.id_estado_solicitud = es.id_estado_solicitud
      WHERE sa.id_solicitud_adopcion = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Crear solicitud de adopción CON NOTIFICACIÓN
export const createAdoptionRequest = async (req, res, next) => {
  try {
    const { id_adopcion } = req.body;
    const id_usuario = req.user.id;

    if (!id_adopcion || !id_usuario) {
      return res.status(400).json({
        success: false,
        error: 'id_adopcion e id_usuario son requeridos',
      });
    }

    const adoptionCheck = await pool.query(
      `SELECT ad.disponible, ad.id_usuario_rescatista, a.nombre_animal
       FROM adopcion ad
       INNER JOIN animal a ON ad.id_animal = a.id_animal
       WHERE ad.id_adopcion = $1`,
      [id_adopcion],
    );

    if (adoptionCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Adopción no encontrada' });
    }

    const { disponible, id_usuario_rescatista, nombre_animal } =
      adoptionCheck.rows[0];

    if (!disponible) {
      return res
        .status(400)
        .json({ success: false, error: 'Esta adopción ya no está disponible' });
    }

    const result = await pool.query(
      `
      INSERT INTO solicitud_adopcion (id_usuario, id_adopcion, id_estado_solicitud)
      VALUES ($1, $2, 1)
      RETURNING *
    `,
      [id_usuario, id_adopcion],
    );

    const newRequest = result.rows[0];

    await auditCreate(
      req,
      'solicitud_adopcion',
      newRequest.id_solicitud_adopcion,
      newRequest,
    );

    try {
      const devicesRes = await pool.query(
        `SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
         FROM dogland.user_push_tokens upt
         INNER JOIN dogland.usuario u ON upt.user_id = u.id_usuario
         WHERE u.activo = true
           AND upt.is_valid = true
           AND upt.push_token IS NOT NULL
           AND (upt.failure_count IS NULL OR upt.failure_count < 3)`,
        [],
      );

      const tokenMap = new Map();
      for (const row of devicesRes.rows) {
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
          `🐾 Nueva Solicitud de Adopción`,
          `Tienes una nueva solicitud para adoptar a ${nombre_animal}`,
          entries,
          {
            type: 'adoption_request',
            id: newRequest.id_solicitud_adopcion,
            id_adopcion,
          },
        );
        console.log(
          `Notificación de nueva solicitud enviada a ${entries.length} tokens (admin)`,
        );

        // 🔔 Guardar notificación en BD con fallback
        try {
          const userIds = entries.map((e) => e.user_id);
          const notificationPayload = {
            title: `🐾 Nueva Solicitud de Adopción`,
            body: `Tienes una nueva solicitud para adoptar a ${nombre_animal}`,
            type: 'adoption_request',
            data: {
              requestId: newRequest.id_solicitud_adopcion,
              id_adopcion,
              nombre_animal,
            },
          };

          await notificationService.createNotificationsBulk(
            userIds,
            notificationPayload,
          );
          console.log(
            `✅ Notificación de solicitud guardada en BD para ${userIds.length} usuarios`,
          );
        } catch (err) {
          console.error(
            '⚠️ Error al guardar notificación de solicitud en BD:',
            err,
          );

          // Fallback si el servicio falla por esquema
          if (
            err &&
            err.code === '42703' &&
            /metadata/i.test(err.message || '')
          ) {
            try {
              const userIds = entries.map((e) => e.user_id);
              const insertPromises = userIds.map((uid) =>
                pool.query(
                  `INSERT INTO notifications (user_id, title, body, type, data, read, created_at)
                   VALUES ($1, $2, $3, $4, $5, false, NOW())`,
                  [
                    uid,
                    `🐾 Nueva Solicitud de Adopción`,
                    `Tienes una nueva solicitud para adoptar a ${nombre_animal}`,
                    'adoption_request',
                    {
                      requestId: newRequest.id_solicitud_adopcion,
                      id_adopcion,
                      nombre_animal,
                    },
                  ],
                ),
              );
              await Promise.all(insertPromises);
              console.log(
                `✅ Notificación guardada en BD (fallback) para ${userIds.length} usuarios`,
              );
            } catch (fallbackErr) {
              console.error(
                '⚠️ Error en fallback al guardar notificaciones en BD:',
                fallbackErr,
              );
            }
          }
        }
      } else {
        console.log(
          'createAdoptionRequest: no se encontraron tokens para notificar',
        );
      }
    } catch (notifError) {
      console.error(
        'Error al enviar notificación de nueva solicitud:',
        notifError,
      );
    }

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar solicitud de adopción (cambiar estado) CON NOTIFICACIÓN
export const updateAdoptionRequest = async (req, res, next) => {
  try {
    const { id_estado_solicitud } = req.body;

    if (!id_estado_solicitud) {
      return res
        .status(400)
        .json({ success: false, error: 'id_estado_solicitud es requerido' });
    }

    // Obtener información de la solicitud antes de actualizar
    const solicitudInfo = await pool.query(
      `SELECT sa.id_usuario, ad.id_usuario_rescatista, a.nombre_animal, sa.id_adopcion
       FROM solicitud_adopcion sa
       INNER JOIN adopcion ad ON sa.id_adopcion = ad.id_adopcion
       INNER JOIN animal a ON ad.id_animal = a.id_animal
       WHERE sa.id_solicitud_adopcion = $1`,
      [req.params.id],
    );

    if (solicitudInfo.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    const {
      id_usuario: solicitante_id,
      nombre_animal,
      id_adopcion,
    } = solicitudInfo.rows[0];

    // Obtener valores antiguos antes de actualizar
    const oldRequest = await getOldValuesForAudit(
      'solicitud_adopcion',
      'id_solicitud_adopcion',
      req.params.id,
    );

    if (!oldRequest) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    const result = await pool.query(
      `
      UPDATE solicitud_adopcion
      SET id_estado_solicitud = $1, fecha_termino_solicitud = CURRENT_TIMESTAMP
      WHERE id_solicitud_adopcion = $2
      RETURNING *
    `,
      [id_estado_solicitud, req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    const updatedRequest = result.rows[0];

    // Si la solicitud fue aprobada (id = 2), marcar la adopción como no disponible
    if (id_estado_solicitud == 2) {
      await pool.query(
        'UPDATE adopcion SET disponible = FALSE, fecha_adopcion = CURRENT_TIMESTAMP WHERE id_adopcion = $1',
        [updatedRequest.id_adopcion],
      );

      // 🔔 NOTIFICAR AL SOLICITANTE - APROBACIÓN
      try {
        const devicesRes = await pool.query(
          `SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
           FROM dogland.user_push_tokens upt
           WHERE upt.user_id = $1
             AND upt.is_valid = true
             AND upt.push_token IS NOT NULL
             AND (upt.failure_count IS NULL OR upt.failure_count < 3)`,
          [solicitante_id],
        );

        console.log(
          'updateAdoptionRequest (aprobacion): tokensRes.rowCount:',
          devicesRes.rowCount,
          'sample rows:',
          devicesRes.rows.slice(0, 5),
        );

        const tokenMap = new Map();
        for (const row of devicesRes.rows) {
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

        console.log(
          'updateAdoptionRequest (aprobacion): tokens deduplicados (entries.length):',
          entries.length,
          'sample entries:',
          entries.slice(0, 5),
        );

        if (entries.length > 0) {
          await sendPushNotificationToUsers(
            `✅ ¡Solicitud Aprobada!`,
            `Tu solicitud de adopción ha sido aprobada.`,
            entries,
            {
              type: 'aprobacion',
              id: req.params.id,
              id_adopcion: id_adopcion,
              nombre_animal: nombre_animal,
            },
          );

          console.log(
            `Notificación de aprobación enviada al solicitante ${solicitante_id}`,
          );
        }
      } catch (notifError) {
        console.error(
          'Error al enviar notificación de aprobación:',
          notifError,
        );
      }
    }

    // Si la solicitud fue rechazada (id = 3)
    if (id_estado_solicitud == 3) {
      // 🔔 NOTIFICAR AL SOLICITANTE - RECHAZO
      try {
        const devicesRes = await pool.query(
          `SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
           FROM dogland.user_push_tokens upt
           WHERE upt.user_id = $1
             AND upt.is_valid = true
             AND upt.push_token IS NOT NULL
             AND (upt.failure_count IS NULL OR upt.failure_count < 3)`,
          [solicitante_id],
        );

        console.log(
          'updateAdoptionRequest (rechazo): tokensRes.rowCount:',
          devicesRes.rowCount,
          'sample rows:',
          devicesRes.rows.slice(0, 5),
        );

        const tokenMap = new Map();
        for (const row of devicesRes.rows) {
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

        console.log(
          'updateAdoptionRequest (rechazo): tokens deduplicados (entries.length):',
          entries.length,
          'sample entries:',
          entries.slice(0, 5),
        );

        if (entries.length > 0) {
          await sendPushNotificationToUsers(
            `❌ Solicitud Rechazada`,
            `Tu solicitud de adopción ha sido rechazada.`,
            entries,
            {
              type: 'rechazo',
              id: req.params.id,
              id_adopcion: id_adopcion,
              nombre_animal: nombre_animal,
            },
          );

          console.log(
            `Notificación de rechazo enviada al solicitante ${solicitante_id}`,
          );
        }
      } catch (notifError) {
        console.error('Error al enviar notificación de rechazo:', notifError);
      }
    }

    // Auditar actualización
    await auditUpdate(req, 'solicitud_adopcion', oldRequest);

    // ✅ Enviar respuesta solo una vez
    res.json({
      success: true,
      data: updatedRequest,
      notificacionEnviada: true,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar solicitud
export const deleteAdoptionRequest = async (req, res, next) => {
  try {
    // Obtener datos antes de eliminar
    const oldRequest = await getOldValuesForAudit(
      'solicitud_adopcion',
      'id_solicitud_adopcion',
      req.params.id,
    );

    if (!oldRequest) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    const result = await pool.query(
      'DELETE FROM solicitud_adopcion WHERE id_solicitud_adopcion = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

    // Auditar eliminación
    await auditDelete(req, 'solicitud_adopcion', oldRequest);

    res.json({ success: true, message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

// FUNCIONES ADICIONALES PARA MANEJAR ADOPCIONES (publicaciones)

// Obtener todas las adopciones disponibles (publicaciones)
export const getAvailableAdoptions = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT ad.id_adopcion, ad.fecha_publicacion, ad.descripcion, ad.disponible,
             a.nombre_animal, a.edad_animal, a.edad_aproximada,
             es.estado_salud,
             r.nombre_raza, e.nombre_especie,
             u.nombre_usuario AS rescatista
      FROM adopcion ad
      INNER JOIN animal a ON ad.id_animal = a.id_animal
      INNER JOIN usuario u ON ad.id_usuario_rescatista = u.id_usuario
      INNER JOIN estado_salud es ON a.id_estado_salud = es.id_estado_salud
      LEFT JOIN raza r ON a.id_raza = r.id_raza
      LEFT JOIN especie e ON r.id_especie = e.id_especie
      WHERE ad.disponible = TRUE
      ORDER BY ad.fecha_publicacion DESC
    `);
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    next(error);
  }
};

// Crear nueva publicación de adopción
export const createAdoptionPost = async (req, res, next) => {
  try {
    const { id_animal, descripcion } = req.body;
    const id_usuario_rescatista = req.user.id;

    if (!id_animal || !id_usuario_rescatista) {
      return res.status(400).json({
        success: false,
        error: 'id_animal e id_usuario_rescatista son requeridos',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [id_animal, id_usuario_rescatista, descripcion],
    );

    const newAdoption = result.rows[0];

    await auditCreate(req, 'adopcion', newAdoption.id_adopcion, newAdoption);

    try {
      const animalInfo = await pool.query(
        `SELECT a.nombre_animal, e.nombre_especie, u.id_ciudad
         FROM animal a
         LEFT JOIN raza r ON a.id_raza = r.id_raza
         LEFT JOIN especie e ON r.id_especie = e.id_especie
         LEFT JOIN usuario u ON $1 = u.id_usuario
         WHERE a.id_animal = $2`,
        [id_usuario_rescatista, id_animal],
      );

      if (animalInfo.rows.length > 0) {
        const { nombre_animal, nombre_especie, id_ciudad } = animalInfo.rows[0];

        const devicesRes = await pool.query(
          `SELECT upt.push_token, upt.device_id, upt.user_id, upt.platform
           FROM dogland.user_push_tokens upt
           INNER JOIN dogland.usuario u ON upt.user_id = u.id_usuario
           WHERE u.id_ciudad = $1
             AND u.activo = true
             AND upt.is_valid = true
             AND upt.push_token IS NOT NULL
             AND u.id_usuario != $2
           LIMIT 100`,
          [id_ciudad, id_usuario_rescatista],
        );

        const tokenMap = new Map();
        for (const row of devicesRes.rows) {
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
            `🐾 Nueva Adopción Disponible`,
            `${nombre_animal} (${nombre_especie}) está disponible para adopción`,
            entries,
            {
              type: 'nueva_adopcion',
              id: newAdoption.id_adopcion,
              id_animal: id_animal,
              nombre_animal: nombre_animal,
            },
          );
          console.log(
            `Notificación de nueva adopción enviada a ${entries.length} usuarios`,
          );

          // 🔔 Guardar notificación en BD con fallback
          try {
            const userIds = entries.map((e) => e.user_id);
            const notificationPayload = {
              title: `🐾 Nueva Adopción Disponible`,
              body: `${nombre_animal} (${nombre_especie}) está disponible para adopción`,
              type: 'nueva_adopcion',
              data: {
                id: newAdoption.id_adopcion,
                id_animal,
                nombre_animal,
              },
            };

            await notificationService.createNotificationsBulk(
              userIds,
              notificationPayload,
            );
            console.log(
              `✅ Notificación de nueva adopción guardada en BD para ${userIds.length} usuarios`,
            );
          } catch (err) {
            console.error(
              '⚠️ Error al guardar notificación de nueva adopción en BD:',
              err,
            );

            // Fallback si el servicio falla por esquema
            if (
              err &&
              err.code === '42703' &&
              /metadata/i.test(err.message || '')
            ) {
              try {
                const insertPromises = userIds.map((uid) =>
                  pool.query(
                    `INSERT INTO notifications (user_id, title, body, type, data, read, created_at)
                     VALUES ($1, $2, $3, $4, $5, false, NOW())`,
                    [
                      uid,
                      `🐾 Nueva Adopción Disponible`,
                      `${nombre_animal} (${nombre_especie}) está disponible para adopción`,
                      'nueva_adopcion',
                      {
                        id: newAdoption.id_adopcion,
                        id_animal,
                        nombre_animal,
                      },
                    ],
                  ),
                );
                await Promise.all(insertPromises);
                console.log(
                  `✅ Notificación guardada en BD (fallback) para ${userIds.length} usuarios`,
                );
              } catch (fallbackErr) {
                console.error(
                  '⚠️ Error en fallback al guardar notificaciones en BD:',
                  fallbackErr,
                );
              }
            }
          }
        } else {
          console.log(
            'createAdoptionPost: no se encontraron tokens para notificar',
          );
        }
      }
    } catch (notifError) {
      console.error(
        'Error al enviar notificación de nueva adopción:',
        notifError,
      );
    }

    res.status(201).json({
      success: true,
      data: newAdoption,
      notificacionesEnviadas: true,
    });
  } catch (error) {
    next(error);
  }
};
