import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// GET /api/users - Listar todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id_usuario, u.nombre_usuario, u.apellido_paterno, u.apellido_materno,
             u.telefono, u.email, u.fecha_nacimiento, u.fecha_creacion, u.activo,
             r.nombre_rol, c.nombre_ciudad, s.sexo, o.nombre_organizacion
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      JOIN ciudad c ON u.id_ciudad = c.id_ciudad
      JOIN sexo s ON u.id_sexo = s.id_sexo
      LEFT JOIN organizacion o ON u.id_organizacion = o.id_organizacion
      ORDER BY u.id_usuario DESC
    `);

    res.json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT u.id_usuario, u.nombre_usuario, u.apellido_paterno, u.apellido_materno,
             u.telefono, u.email, u.fecha_nacimiento, u.fecha_creacion, u.activo,
             r.nombre_rol, c.nombre_ciudad, s.sexo, o.nombre_organizacion
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      JOIN ciudad c ON u.id_ciudad = c.id_ciudad
      JOIN sexo s ON u.id_sexo = s.id_sexo
      LEFT JOIN organizacion o ON u.id_organizacion = o.id_organizacion
      WHERE u.id_usuario = $1
    `,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - Crear usuario
router.post('/users', async (req, res) => {
  try {
    const {
      nombre_usuario,
      apellido_paterno,
      apellido_materno,
      id_sexo,
      fecha_nacimiento,
      telefono,
      email,
      password_hash,
      id_ciudad,
      id_organizacion,
      id_rol,
    } = req.body;

    if (
      !nombre_usuario ||
      !email ||
      !password_hash ||
      !id_sexo ||
      !id_ciudad ||
      !id_rol
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Faltan campos obligatorios (nombre, email, password, sexo, ciudad, rol)',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO usuario
      (nombre_usuario, apellido_paterno, apellido_materno, id_sexo, fecha_nacimiento, telefono, email, password_hash, id_ciudad, id_organizacion, id_rol)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `,
      [
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        id_sexo,
        fecha_nacimiento,
        telefono,
        email,
        password_hash,
        id_ciudad,
        id_organizacion,
        id_rol,
      ],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const {
      nombre_usuario,
      apellido_paterno,
      apellido_materno,
      telefono,
      email,
      id_ciudad,
      id_organizacion,
      id_rol,
      activo,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE usuario
      SET nombre_usuario   = COALESCE($1, nombre_usuario),
          apellido_paterno = COALESCE($2, apellido_paterno),
          apellido_materno = COALESCE($3, apellido_materno),
          telefono         = COALESCE($4, telefono),
          email            = COALESCE($5, email),
          id_ciudad        = COALESCE($6, id_ciudad),
          id_organizacion  = COALESCE($7, id_organizacion),
          id_rol           = COALESCE($8, id_rol),
          activo           = COALESCE($9, activo)
      WHERE id_usuario = $10
      RETURNING *
    `,
      [
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
        id_ciudad,
        id_organizacion,
        id_rol,
        activo,
        req.params.id,
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM usuario WHERE id_usuario = $1 RETURNING *',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users/savePushToken', async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ success: false, error: 'Faltan datos' });
  }
  try {
    await pool.query(
      'UPDATE usuario SET push_token = $1 WHERE id_usuario = $2',
      [token, userId],
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando token push:', error);
    res.status(500).json({ success: false, error: 'Error guardando token' });
  }
});

export default router;
