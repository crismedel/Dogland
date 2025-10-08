import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

router.get('/races/:speciesId', async (req, res) => {
  const { speciesId } = req.params;
  try {
    const result = await pool.query(
      ` 
        SELECT 
            id_raza, nombre_raza
        FROM 
            raza
        WHERE id_especie = $1
    `, [speciesId]
    );  
    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
});

export default router;