import express from 'express';
import pool from '../db/db.js'

// Endpoint para obtener las regiones
// Se utilizara para los dropdown en registro, etc.

const router = express.Router();

router.get('/regions', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          r.id_region, r.nombre_region 
        FROM 
          region r
        ORDER BY 
          r.nombre_region ASC
      `
    );
    res.json({ success: true, data: result.rows, count: result.rowCount })
  }
  catch (error){
    res.status(500).json({ success: false, error: error.message })
  }
});

export default router;