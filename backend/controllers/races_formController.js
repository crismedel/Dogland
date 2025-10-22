import pool from '../db/db.js';

export const getRaces = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id_raza, nombre_raza FROM raza ORDER BY nombre_raza ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};