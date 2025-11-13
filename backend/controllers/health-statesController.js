// backend/controllers/health-statesController.js
import pool from '../db/db.js';

/**
 * Obtiene todos los estados de salud de la base de datos
 */
export const getAllHealthStates = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM dogland.estado_salud ORDER BY id_estado_salud;';
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener estados de salud:', error);
    next(error); // Pasa el error al middleware de errores
  }
};

