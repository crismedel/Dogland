import pool from '../db/db.js';

// Middleware para validar los datos de una alerta en el cuerpo de la solicitud antes de procesarla
export const validateAlert = async (req, res, next) => {
  const {
    titulo,
    descripcion,
    id_tipo_alerta,
    id_nivel_riesgo,
    ubicacion,
    fecha_expiracion,
    id_usuario,
  } = req.body;

  // Determina si la solicitud es para crear una nueva alerta (método POST)
  const isCreate = req.method === 'POST';

  // Verifica que los campos requeridos estén presentes; id_usuario es obligatorio solo en creación
  if (
    !titulo ||
    !descripcion ||
    !id_tipo_alerta ||
    !id_nivel_riesgo ||
    (isCreate && !id_usuario)
  ) {
    return res
      .status(400)
      .json({ success: false, error: 'Campos requeridos faltantes' });
  }

  // Valida que 'titulo' sea una cadena y no sea demasiado largo
  if (typeof titulo !== 'string' || titulo.length > 100) {
    return res
      .status(400)
      .json({ success: false, error: 'Título inválido o demasiado largo' });
  }

  // Valida que 'descripcion' sea una cadena no vacía
  if (typeof descripcion !== 'string' || descripcion.trim() === '') {
    return res
      .status(400)
      .json({ success: false, error: 'Descripción inválida' });
  }

  // Valida que los IDs, si están presentes, sean números enteros válidos
  if (id_tipo_alerta && isNaN(parseInt(id_tipo_alerta, 10))) {
    return res
      .status(400)
      .json({ success: false, error: 'ID tipo alerta inválido' });
  }
  if (id_nivel_riesgo && isNaN(parseInt(id_nivel_riesgo, 10))) {
    return res
      .status(400)
      .json({ success: false, error: 'ID nivel riesgo inválido' });
  }
  if (id_usuario && isNaN(parseInt(id_usuario, 10))) {
    return res
      .status(400)
      .json({ success: false, error: 'ID usuario inválido' });
  }

  // Verifica la existencia de las entidades relacionadas en la base de datos si se proporcionan los IDs
  try {
    if (id_tipo_alerta) {
      const tipoResult = await pool.query(
        'SELECT 1 FROM tipo_alerta WHERE id_tipo_alerta = $1',
        [parseInt(id_tipo_alerta, 10)],
      );
      if (tipoResult.rowCount === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'Tipo de alerta no válido' });
      }
    }

    if (id_nivel_riesgo) {
      const riesgoResult = await pool.query(
        'SELECT 1 FROM nivel_riesgo WHERE id_nivel_riesgo = $1',
        [parseInt(id_nivel_riesgo, 10)],
      );
      if (riesgoResult.rowCount === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'Nivel de riesgo no válido' });
      }
    }

    if (id_usuario) {
      const usuarioResult = await pool.query(
        'SELECT 1 FROM usuario WHERE id_usuario = $1',
        [parseInt(id_usuario, 10)],
      );
      if (usuarioResult.rowCount === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'Usuario no válido' });
      }
    }
  } catch (error) {
    // Maneja errores en las consultas a la base de datos
    return res
      .status(500)
      .json({ success: false, error: 'Error validando datos relacionados' });
  }

  // Valida 'ubicacion' si está presente: debe ser una cadena y no demasiado larga
  if (ubicacion && (typeof ubicacion !== 'string' || ubicacion.length > 255)) {
    return res
      .status(400)
      .json({ success: false, error: 'Ubicación inválida' });
  }

  next();
};
