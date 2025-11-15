// backend/controllers/speciesController.js
import pool from '../db/db.js';

/**
 * Obtiene todas las especies de la base de datos
 */
export const getAllSpecies = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM dogland.especie ORDER BY id_especie;';
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener especies:', error);
    next(error);
  }
};
