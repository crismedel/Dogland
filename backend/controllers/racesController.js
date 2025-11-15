// backend/controllers/racesController.js
import pool from '../db/db.js';

/**
 * Obtiene todas las razas, opcionalmente filtradas por id_especie.
 */
export const getAllRaces = async (req, res, next) => {
  const { id_especie } = req.query; // Capturamos el filtro de la URL

  try {
    let query = 'SELECT * FROM dogland.raza';
    const values = [];

    if (id_especie) {
      query += ' WHERE id_especie = $1'; // Agregamos filtro si existe
      values.push(id_especie);
    }

    query += ' ORDER BY nombre_raza;'; // Ordenamos alfabéticamente

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener razas:', error);
    next(error);
  }
};
