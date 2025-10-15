import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// GET /api/organizations - Listar todas las organizaciones
router.get('/organizations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_organizacion, nombre_organizacion, telefono_organizacion, 
             email_organizacion, direccion
      FROM organizacion
      ORDER BY id_organizacion DESC
    `);

    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/organizations/:id - Obtener organización por ID
router.get('/organizations/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id_organizacion, nombre_organizacion, telefono_organizacion, 
             email_organizacion, direccion
      FROM organizacion
      WHERE id_organizacion = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Organización no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/organizations - Crear nueva organización
router.post('/organizations', async (req, res) => {
  try {
    const {
      nombre_organizacion,
      telefono_organizacion,
      email_organizacion,
      direccion,
    } = req.body;

    if (!nombre_organizacion) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la organización es requerido',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO organizacion (nombre_organizacion, telefono_organizacion, email_organizacion, direccion) 
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [
        nombre_organizacion,
        telefono_organizacion,
        email_organizacion,
        direccion,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/organizations/:id - Actualizar organización
router.put('/organizations/:id', async (req, res) => {
  try {
    const {
      nombre_organizacion,
      telefono_organizacion,
      email_organizacion,
      direccion,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE organizacion
      SET nombre_organizacion   = COALESCE($1, nombre_organizacion),
          telefono_organizacion = COALESCE($2, telefono_organizacion),
          email_organizacion    = COALESCE($3, email_organizacion),
          direccion             = COALESCE($4, direccion)
      WHERE id_organizacion = $5
      RETURNING *
    `,
      [
        nombre_organizacion,
        telefono_organizacion,
        email_organizacion,
        direccion,
        req.params.id,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Organización no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/organizations/:id - Eliminar organización
router.delete('/organizations/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM organizacion WHERE id_organizacion = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Organización no encontrada' });
    }

    res.json({
      success: true,
      message: 'Organización eliminada correctamente',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
