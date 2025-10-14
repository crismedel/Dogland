import pool from '../db/db.js';

export const listAllUsers = async (req, res, next) => {
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
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
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
      [userId]
    );
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
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
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
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
    } = req.validatedBody;
    
    const result = await pool.query(
      `
      INSERT INTO usuario (nombre_usuario, apellido_paterno, apellido_materno, id_sexo, 
        fecha_nacimiento, telefono, email, password_hash, id_ciudad, id_organizacion, id_rol)
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
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
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
    } = req.validatedBody;
    
    if (id_ciudad) {
      const cityExistsResult = await pool.query(
        'SELECT 1 FROM ciudad WHERE id_ciudad = $1',
        [id_ciudad]
      );
      if (cityExistsResult.rowCount === 0) {
        return res.status(400).json({
          success: false,
          error: `La ciudad con id '${id_ciudad}' no existe.`,
        });
      }
    }
    
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
        id,
      ]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.validatedParams;
  let client;
  
  try {
    client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, email',
        [id]
      );
      
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      
      await client.query('COMMIT');
      res.json({
        success: true,
        message: 'Usuario eliminado correctamente',
        data: result.rows[0],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    next(error);
  } finally {
    if (client) client.release();
  }
};

export const deactivateUser = async (req, res, next) => {
  const { id } = req.validatedParams;
  let client;
  
  try {
    client = await pool.connect();
    
    const result = await client.query(
      `UPDATE usuario
       SET activo = false, deleted_at = NOW()
       WHERE id_usuario = $1
       RETURNING id_usuario, email`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Usuario desactivado correctamente',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  } finally {
    if (client) client.release();
  }
};

export const activateUser = async (req, res, next) => {
  const { id } = req.validatedParams;
  let client;
  
  try {
    client = await pool.connect();
    
    const result = await client.query(
      `UPDATE usuario
       SET activo = true, deleted_at = NULL
       WHERE id_usuario = $1
       RETURNING id_usuario, email, activo`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario activado correctamente',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  } finally {
    if (client) client.release();
  }
};

export const savePushToken = async (req, res, next) => {
  const { token, plataforma } = req.validatedBody;
  const id = req.user.id;
  
  try {
    const query = `
      INSERT INTO dispositivo (id_usuario, token, plataforma)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) DO UPDATE
      SET
        id_usuario = EXCLUDED.id_usuario,
        plataforma = EXCLUDED.plataforma,
        fecha_actualizacion = NOW();
    `;
    
    await pool.query(query, [id, token, plataforma]);
    
    res.json({
      success: true,
      message: 'Dispositivo registrado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
};
