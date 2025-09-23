import pool from '../db/db.js';

// Middleware para validar los datos de un animal en el cuerpo de la solicitud
export const validateAnimal = async (req, res, next) => {
  const { nombre, edad, descripcion, id_sexo, id_organizacion, disponible } = req.body;

  const isCreate = req.method === 'POST';

  // Campos requeridos al crear
  if (isCreate && (!nombre || !id_sexo || !id_organizacion)) {
    return res.status(400).json({
      success: false,
      error: 'Campos requeridos faltantes (nombre, id_sexo, id_organizacion)',
    });
  }

  // Validaciones básicas
  if (nombre && (typeof nombre !== 'string' || nombre.length > 50)) {
    return res
      .status(400)
      .json({ success: false, error: 'Nombre inválido o demasiado largo' });
  }

  if (edad && (isNaN(parseInt(edad, 10)) || edad < 0)) {
    return res.status(400).json({ success: false, error: 'Edad inválida' });
  }

  if (descripcion && typeof descripcion !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'Descripción inválida' });
  }

  if (disponible != null && typeof disponible !== 'boolean') {
    return res
      .status(400)
      .json({ success: false, error: 'Disponible debe ser true o false' });
  }

  // Validar que los IDs existan en la base de datos
  try {
    if (id_sexo) {
      const sexoRes = await pool.query(
        'SELECT 1 FROM sexo WHERE id_sexo = $1',
        [parseInt(id_sexo, 10)],
      );
      if (sexoRes.rowCount === 0) {
        return res.status(400).json({ success: false, error: 'Sexo no válido' });
      }
    }

    if (id_organizacion) {
      const orgRes = await pool.query(
        'SELECT 1 FROM organizacion WHERE id_organizacion = $1',
        [parseInt(id_organizacion, 10)],
      );
      if (orgRes.rowCount === 0) {
        return res
          .status(400)
          .json({ success: false, error: 'Organización no válida' });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Error validando datos relacionados' });
  }

  next();
};
