import express from 'express';
import pool from '../db/db.js'

const router = express.Router();

router.get('/species', async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT 
          e.id_especie, e.nombre_especie
        FROM 
          especie AS e
      `
    );
    res.json({ success: true, data: result.rows, count: result.rowCount })
  }
  catch (error){
    res.status(500).json({ success: false, error: error.message })
  }
});

export default router;