import pool from '../db/db.js';
import { sendPushNotificationToUsers } from '../middlewares/pushNotifications.js';

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

    // Obtener el id desde el token
    const id_usuario = req.user.id;

    // Verifica que los campos obligatorios estén presentes
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

    // Inserta la nueva alerta en la base de datos, activa por defecto y sin reportes
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

    // Enviar notificación si nivel de riesgo es alto (ejemplo: id_nivel_riesgo === 3)
    if (id_nivel_riesgo === 3) {
      const usersRes = await pool.query('SELECT id_usuario FROM usuario');
      const userIds = usersRes.rows.map((row) => row.id_usuario);

      await sendPushNotificationToUsers(
        `Nueva alerta importante: ${titulo}`,
        userIds,
      );
    }

    // Responde con la alerta creada y código 201
    res.status(201).json({ success: true, data: result.rows[0] });
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

    // Si no se encuentra la alerta para actualizar, responde con error 404
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    // Devuelve la alerta actualizada
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Elimina una alerta por su ID
export const deleteAlert = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM alerta WHERE id_alerta = $1 RETURNING *',
      [req.params.id],
    );

    // Si no se encuentra la alerta para eliminar, responde con error 404
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    // Confirma la eliminación exitosa
    res.json({ success: true, message: 'Alerta eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
