import pool from '../db/db.js'; // Ajusta la ruta a tu archivo de conexión

/**
 * @controller getEspecies
 * @desc       Obtiene todos los registros de la tabla de especies.
 */
export const getEspecies = async (req, res, next) => {
  try {
    // La imagen confirma la tabla 'especie'
    const result = await pool.query('SELECT * FROM dogland.especie ORDER BY nombre_especie');
    
    res.json({ 
      success: true, 
      data: result.rows, 
      count: result.rowCount 
    });
  } catch (error) {
    next(error);
  }
};