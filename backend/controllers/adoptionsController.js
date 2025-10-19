import pool from '../db/db.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';

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

    // Obtener el id desde el token
    const id_usuario = req.user.id;

    if (!id_adopcion || !id_usuario) {
      return res.status(400).json({
        success: false,
        error: 'id_adopcion e id_usuario son requeridos',
      });
    }

    // Verificar que la adopción existe y está disponible
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

    // Crear solicitud con estado "Pendiente" (id = 1)
    const result = await pool.query(
      `
      INSERT INTO solicitud_adopcion (id_usuario, id_adopcion, id_estado_solicitud)
      VALUES ($1, $2, 1)
      RETURNING *
    `,
      [id_usuario, id_adopcion],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
    // 🔔 ENVIAR NOTIFICACIÓN AL RESCATISTA
    try {
      await sendPushNotificationToUsers(
        `🐾 Nueva Solicitud de Adopción`,
        `Tienes una nueva solicitud para adoptar a ${nombre_animal}`,
        [id_usuario_rescatista],
        {
          type: 'solicitud',
          id: result.rows[0].id_solicitud_adopcion,
          id_adopcion: id_adopcion,
          nombre_animal: nombre_animal,
        },
      );
      console.log(
        `✅ Notificación de solicitud enviada al rescatista ${id_usuario_rescatista}`,
      );
    } catch (notifError) {
      console.error(
        '⚠️ Error al enviar notificación de solicitud:',
        notifError,
      );
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      notificacionEnviada: true,
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

    // Si la solicitud fue aprobada (id = 2), marcar la adopción como no disponible
    if (id_estado_solicitud == 2) {
      const solicitud = result.rows[0];
      await pool.query(
        'UPDATE adopcion SET disponible = FALSE, fecha_adopcion = CURRENT_TIMESTAMP WHERE id_adopcion = $1',
        [solicitud.id_adopcion],
      );

      // 🔔 NOTIFICAR AL SOLICITANTE - APROBACIÓN
      try {
        await sendPushNotificationToUsers(
          `✅ ¡Solicitud Aprobada!`,
          `Tu solicitud para adoptar a ${nombre_animal} ha sido aprobada. ¡Felicidades!`,
          [solicitante_id],
          {
            type: 'aprobacion',
            id: req.params.id,
            id_adopcion: id_adopcion,
            nombre_animal: nombre_animal,
          },
        );
        console.log(
          `✅ Notificación de aprobación enviada al solicitante ${solicitante_id}`,
        );
      } catch (notifError) {
        console.error(
          '⚠️ Error al enviar notificación de aprobación:',
          notifError,
        );
      }
    }

    // Si la solicitud fue rechazada (id = 3)
    if (id_estado_solicitud == 3) {
      // 🔔 NOTIFICAR AL SOLICITANTE - RECHAZO
      try {
        await sendPushNotificationToUsers(
          `❌ Solicitud Rechazada`,
          `Tu solicitud para adoptar a ${nombre_animal} ha sido rechazada.`,
          [solicitante_id],
          {
            type: 'rechazo',
            id: req.params.id,
            id_adopcion: id_adopcion,
            nombre_animal: nombre_animal,
          },
        );
        console.log(
          `✅ Notificación de rechazo enviada al solicitante ${solicitante_id}`,
        );
      } catch (notifError) {
        console.error(
          '⚠️ Error al enviar notificación de rechazo:',
          notifError,
        );
      }
    }

    res.json({
      success: true,
      data: result.rows[0],
      notificacionEnviada: true,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar solicitud
export const deleteAdoptionRequest = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM solicitud_adopcion WHERE id_solicitud_adopcion = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Solicitud no encontrada' });
    }

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

    // Obtener el id de rescatista del token por seguridad
    const id_usuario_rescatista = req.user.id;

    if (!id_animal || !id_usuario_rescatista) {
      return res.status(400).json({
        success: false,
        error: 'id_animal e id_usuario_rescatista son requeridos',
      });
    }

    // Obtener información del animal
    const animalInfo = await pool.query(
      `SELECT a.nombre_animal, e.nombre_especie, u.id_ciudad
       FROM animal a
       LEFT JOIN raza r ON a.id_raza = r.id_raza
       LEFT JOIN especie e ON r.id_especie = e.id_especie
       LEFT JOIN usuario u ON $1 = u.id_usuario
       WHERE a.id_animal = $2`,
      [id_usuario_rescatista, id_animal],
    );

    const result = await pool.query(
      `
      INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [id_animal, id_usuario_rescatista, descripcion],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
    // 🔔 NOTIFICAR A USUARIOS INTERESADOS EN LA MISMA CIUDAD
    if (animalInfo.rows.length > 0) {
      const { nombre_animal, nombre_especie, id_ciudad } = animalInfo.rows[0];

      try {
        const usersToNotify = await pool.query(
          `SELECT id_usuario 
           FROM usuario 
           WHERE id_ciudad = $1 
           AND activo = true 
           AND push_token IS NOT NULL
           AND id_usuario != $2
           LIMIT 100`,
          [id_ciudad, id_usuario_rescatista],
        );

        if (usersToNotify.rows.length > 0) {
          const userIds = usersToNotify.rows.map((row) => row.id_usuario);

          await sendPushNotificationToUsers(
            `🐾 Nueva Adopción Disponible`,
            `${nombre_animal} (${nombre_especie}) está disponible para adopción`,
            userIds,
            {
              type: 'nueva_adopcion',
              id: result.rows[0].id_adopcion,
              id_animal: id_animal,
              nombre_animal: nombre_animal,
            },
          );
          console.log(
            `✅ Notificación de nueva adopción enviada a ${userIds.length} usuarios`,
          );
        }
      } catch (notifError) {
        console.error(
          '⚠️ Error al enviar notificación de nueva adopción:',
          notifError,
        );
      }
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      notificacionesEnviadas: true,
    });
  } catch (error) {
    next(error);
  }
};
