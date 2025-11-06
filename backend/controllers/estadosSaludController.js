import pool from '../db/db.js'; // Ajusta la ruta a tu archivo de conexión

/**
 * @controller getEstadosSalud
 * @desc       Obtiene todos los registros de la tabla de estados de salud.
 */
export const getEstadosSalud = async (req, res, next) => {
  try {
    // La imagen confirma la tabla 'estado_salud'
    const result = await pool.query('SELECT * FROM dogland.estado_salud ORDER BY id_estado_salud');
    
    res.json({ 
      success: true, 
      data: result.rows, 
      count: result.rowCount 
    });
  } catch (error) {
    next(error);
  }
};