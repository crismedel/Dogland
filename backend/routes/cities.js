import express from 'express';
import pool from '../db/db.js';

// Endpoint para obtener las ciudades por region
// Se utilizara para los dropdown en registro, etc.

const router = express.Router();

router.get('/cities/:regionId', async (req, res) => {
  const { regionId } = req.params;
  try {
    const result = await pool.query(
      ` 
        SELECT 
          c.id_ciudad, 
          c.nombre_ciudad 
        FROM 
          ciudad c
        WHERE c.id_region = $1
        ORDER BY 
          c.id_ciudad DESC
    `, [regionId]
    );  
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
});

export default router;