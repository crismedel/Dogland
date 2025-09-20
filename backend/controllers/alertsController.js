import pool from '../db/db.js';

// Obtiene todas las alertas activas, con detalles relacionados de tipo, nivel de riesgo y creador
export const getAlerts = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.ubicacion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por
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

// Obtiene una alerta específica por su ID, incluyendo detalles relacionados
export const getAlertById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.ubicacion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por
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
      id_usuario,
      ubicacion,
      fecha_expiracion,
    } = req.body;

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

    // Inserta la nueva alerta en la base de datos, activa por defecto y sin reportes
    const result = await pool.query(
      `
      INSERT INTO alerta (titulo, descripcion, id_tipo_alerta, id_nivel_riesgo, id_usuario, ubicacion, fecha_expiracion, activa, reportes) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        id_usuario,
        ubicacion,
        fecha_expiracion,
      ],
    );

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
      ubicacion,
      fecha_expiracion,
      activa,
    } = req.body;

    // Actualiza la alerta usando COALESCE para mantener valores actuales si no se proporcionan nuevos
    const result = await pool.query(
      `
      UPDATE alerta
      SET titulo = COALESCE($1, titulo),
          descripcion = COALESCE($2, descripcion),
          id_tipo_alerta = COALESCE($3, id_tipo_alerta),
          id_nivel_riesgo = COALESCE($4, id_nivel_riesgo),
          ubicacion = COALESCE($5, ubicacion),
          fecha_expiracion = COALESCE($6, fecha_expiracion),
          activa = COALESCE($7, activa)
      WHERE id_alerta = $8
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        ubicacion,
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
