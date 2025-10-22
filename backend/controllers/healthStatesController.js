import pool from '../db/db.js';

export const getHealthStates = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id_estado_salud, estado_salud FROM estado_salud ORDER BY id_estado_salud ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};