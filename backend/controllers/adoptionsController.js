import pool from '../db/db.js';

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
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Crear solicitud de adopción
export const createAdoptionRequest = async (req, res, next) => {
  try {
    const { id_adopcion, id_usuario } = req.body;

    if (!id_adopcion || !id_usuario) {
      return res.status(400).json({ success: false, error: 'id_adopcion e id_usuario son requeridos' });
    }

    // Verificar que la adopción existe y está disponible
    const adoptionCheck = await pool.query(
      'SELECT disponible FROM adopcion WHERE id_adopcion = $1',
      [id_adopcion]
    );

    if (adoptionCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Adopción no encontrada' });
    }

    if (!adoptionCheck.rows[0].disponible) {
      return res.status(400).json({ success: false, error: 'Esta adopción ya no está disponible' });
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
  } catch (error) {
    next(error);
  }
};

// Actualizar solicitud de adopción (cambiar estado)
export const updateAdoptionRequest = async (req, res, next) => {
  try {
    const { id_estado_solicitud } = req.body;

    if (!id_estado_solicitud) {
      return res.status(400).json({ success: false, error: 'id_estado_solicitud es requerido' });
    }

    const result = await pool.query(
      `
      UPDATE solicitud_adopcion
      SET id_estado_solicitud = $1
      WHERE id_solicitud_adopcion = $2
      RETURNING *
    `,
      [id_estado_solicitud, req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
    }

    // Si la solicitud fue aprobada (id = 2), marcar la adopción como no disponible
    if (id_estado_solicitud == 2) {
      const solicitud = result.rows[0];
      await pool.query(
        'UPDATE adopcion SET disponible = FALSE, fecha_adopcion = CURRENT_TIMESTAMP WHERE id_adopcion = $1',
        [solicitud.id_adopcion]
      );
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
      'DELETE FROM solicitud_adopcion WHERE id_solicitud_adopcion = $1 RETURNING *',
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
    const { id_animal, id_usuario_rescatista, descripcion } = req.body;

    if (!id_animal || !id_usuario_rescatista) {
      return res.status(400).json({ success: false, error: 'id_animal e id_usuario_rescatista son requeridos' });
    }

    const result = await pool.query(
      `
      INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [id_animal, id_usuario_rescatista, descripcion],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};