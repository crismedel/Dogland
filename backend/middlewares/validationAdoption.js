import pool from '../db/db.js';

// Middleware para validar los datos de una solicitud de adopción
export const validateAdoption = async (req, res, next) => {
  const { id_animal, id_usuario, observaciones, estado } = req.body;

  const isCreate = req.method === 'POST';

  // Campos requeridos al crear
  if (isCreate && (!id_animal || !id_usuario)) {
    return res
      .status(400)
      .json({ success: false, error: 'Campos requeridos faltantes (id_animal, id_usuario)' });
  }

  // Validaciones básicas
  if (id_animal && isNaN(parseInt(id_animal, 10))) {
    return res.status(400).json({ success: false, error: 'ID animal inválido' });
  }

  if (id_usuario && isNaN(parseInt(id_usuario, 10))) {
    return res.status(400).json({ success: false, error: 'ID usuario inválido' });
  }

  if (observaciones && typeof observaciones !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'Observaciones inválidas' });
  }

  if (estado && !['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
    return res
      .status(400)
      .json({ success: false, error: 'Estado inválido (pendiente, aprobada, rechazada)' });
  }

  // Validar existencia de IDs
  try {
    if (id_animal) {
      const animalRes = await pool.query(
        'SELECT 1 FROM animal WHERE id_animal = $1',
        [parseInt(id_animal, 10)],
      );
      if (animalRes.rowCount === 0) {
        return res.status(400).json({ success: false, error: 'Animal no válido' });
      }
    }

    if (id_usuario) {
      const userRes = await pool.query(
        'SELECT 1 FROM usuario WHERE id_usuario = $1',
        [parseInt(id_usuario, 10)],
      );
      if (userRes.rowCount === 0) {
        return res.status(400).json({ success: false, error: 'Usuario no válido' });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: 'Error validando datos relacionados' });
  }

  next();
};
