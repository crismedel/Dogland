import pool from '../db/db.js';

// Todas las solicitudes
export const getAdoptions = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT ad.id_adopcion, ad.estado, ad.fecha_solicitud, ad.observaciones,
             a.nombre AS animal, u.nombre_usuario AS solicitante
      FROM adopcion ad
      INNER JOIN animal a ON ad.id_animal = a.id_animal
      INNER JOIN usuario u ON ad.id_usuario = u.id_usuario
      ORDER BY ad.fecha_solicitud DESC
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
      SELECT ad.id_adopcion, ad.estado, ad.fecha_solicitud, ad.observaciones,
             a.nombre AS animal, u.nombre_usuario AS solicitante
      FROM adopcion ad
      INNER JOIN animal a ON ad.id_animal = a.id_animal
      INNER JOIN usuario u ON ad.id_usuario = u.id_usuario
      WHERE ad.id_adopcion = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Crear solicitud
export const createAdoptionRequest = async (req, res, next) => {
  try {
    const { id_animal, id_usuario, observaciones } = req.body;

    if (!id_animal || !id_usuario) {
      return res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
    }

    const result = await pool.query(
      `
      INSERT INTO adopcion (id_animal, id_usuario, observaciones, estado)
      VALUES ($1,$2,$3,'pendiente')
      RETURNING *
    `,
      [id_animal, id_usuario, observaciones],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Actualizar solicitud
export const updateAdoptionRequest = async (req, res, next) => {
  try {
    const { estado, observaciones } = req.body;

    const result = await pool.query(
      `
      UPDATE adopcion
      SET estado = COALESCE($1, estado),
          observaciones = COALESCE($2, observaciones)
      WHERE id_adopcion = $3
      RETURNING *
    `,
      [estado, observaciones, req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Eliminar solicitud
export const deleteAdoptionRequest = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM adopcion WHERE id_adopcion = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    res.json({ success: true, message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
