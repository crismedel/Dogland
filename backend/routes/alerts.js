import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// GET /api/alerts - Listar alertas activas
router.get('/alerts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.ubicacion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por
      FROM alerta a
      INNER JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      INNER JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE a.activa = true
      ORDER BY a.fecha_creacion DESC
    `);

    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/alerts/:id - Obtener alerta por id
router.get('/alerts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT a.id_alerta, a.titulo, a.descripcion, a.fecha_creacion, 
             a.fecha_expiracion, a.ubicacion, a.activa, a.reportes,
             ta.tipo_alerta AS tipo,
             nr.nivel_riesgo AS nivel_riesgo,
             u.nombre_usuario AS creado_por
      FROM alerta a
      INNER JOIN tipo_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
      INNER JOIN nivel_riesgo nr ON a.id_nivel_riesgo = nr.id_nivel_riesgo
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE a.id_alerta = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/alerts - Crear alerta
router.post('/alerts', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      id_tipo_alerta,
      id_nivel_riesgo,
      id_usuario,
      ubicacion,
      fecha_expiracion,
    } = req.body;

    if (
      !titulo ||
      !descripcion ||
      !id_tipo_alerta ||
      !id_nivel_riesgo ||
      !id_usuario
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Campos requeridos faltantes' });
    }

    const result = await pool.query(
      `
      INSERT INTO alerta (titulo, descripcion, id_tipo_alerta, id_nivel_riesgo, id_usuario, ubicacion, fecha_expiracion, activa, reportes) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        id_usuario,
        ubicacion,
        fecha_expiracion,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/alerts/:id - Actualizar alerta
router.put('/alerts/:id', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      id_tipo_alerta,
      id_nivel_riesgo,
      ubicacion,
      fecha_expiracion,
      activa,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE alerta
      SET titulo = COALESCE($1, titulo),
          descripcion = COALESCE($2, descripcion),
          id_tipo_alerta = COALESCE($3, id_tipo_alerta),
          id_nivel_riesgo = COALESCE($4, id_nivel_riesgo),
          ubicacion = COALESCE($5, ubicacion),
          fecha_expiracion = COALESCE($6, fecha_expiracion),
          activa = COALESCE($7, activa)
      WHERE id_alerta = $8
      RETURNING *
    `,
      [
        titulo,
        descripcion,
        id_tipo_alerta,
        id_nivel_riesgo,
        ubicacion,
        fecha_expiracion,
        activa,
        req.params.id,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/alerts/:id - Eliminar alerta
router.delete('/alerts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM alerta WHERE id_alerta = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Alerta no encontrada' });
    }

    res.json({ success: true, message: 'Alerta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
