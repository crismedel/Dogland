import pool from '../db/db.js';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../services/auditService.js';
import { getOldValuesForAudit, sanitizeForAudit } from '../utils/audit.js';

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
      count: result.rowCount,
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
             u.id_sexo, u.has_2fa,
             r.nombre_rol, c.nombre_ciudad, s.sexo, o.nombre_organizacion
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      JOIN ciudad c ON u.id_ciudad = c.id_ciudad
      JOIN sexo s ON u.id_sexo = s.id_sexo
      LEFT JOIN organizacion o ON u.id_organizacion = o.id_organizacion
      WHERE u.id_usuario = $1
      `,
      [userId],
    );
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
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
    } = req.body;

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
      ],
    );

    const newUser = result.rows[0];

    // Sanitizar antes de auditar
    const newUserSafe = sanitizeForAudit('usuario', newUser);
    await auditCreate(req, 'usuario', newUser.id_usuario, newUserSafe);

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
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

    // Usar helper para auditar
    const oldUser = await getOldValuesForAudit('usuario', 'id_usuario', id);

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Validacion de ciudad
    if (id_ciudad) {
      const cityExistsResult = await pool.query(
        'SELECT 1 FROM ciudad WHERE id_ciudad = $1',
        [id_ciudad],
      );
      if (cityExistsResult.rowCount === 0) {
        return res.status(400).json({
          success: false,
          error: `La ciudad con id '${id_ciudad}' no existe.`,
        });
      }
    }

    // Hacer el UPDATE
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
      ],
    );

    const updatedUser = result.rows[0];

    // Usar helper para sanitizar
    const oldUserSafe = sanitizeForAudit('usuario', oldUser);
    await auditUpdate(req, 'usuario', oldUserSafe);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOwnProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; // Del token JWT
    const {
      nombre_usuario,
      apellido_paterno,
      apellido_materno,
      telefono,
      fecha_nacimiento,
      id_sexo,
    } = req.body;

    const oldUser = await getOldValuesForAudit('usuario', 'id_usuario', userId);

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const result = await pool.query(
      `UPDATE usuario
       SET nombre_usuario   = COALESCE($1, nombre_usuario),
           apellido_paterno = COALESCE($2, apellido_paterno),
           apellido_materno = COALESCE($3, apellido_materno),
           telefono         = COALESCE($4, telefono),
           fecha_nacimiento = COALESCE($5, fecha_nacimiento),
           id_sexo          = COALESCE($6, id_sexo)
       WHERE id_usuario = $7
       RETURNING *`,
      [
        nombre_usuario,
        apellido_paterno,
        apellido_materno,
        telefono,
        fecha_nacimiento,
        id_sexo,
        userId,
      ],
    );

    const updatedUser = result.rows[0];

    // Crear un objeto req temporal con params.id
    const oldUserSafe = sanitizeForAudit('usuario', oldUser);
    const reqWithParams = {
      ...req,
      params: { id: userId }, // Agregar params.id para que auditUpdate funcione
    };
    await auditUpdate(reqWithParams, 'usuario', oldUserSafe);

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Error en updateOwnProfile:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Usar helper para auditar
      const oldUser = await getOldValuesForAudit('usuario', 'id_usuario', id);

      if (!oldUser) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      // Eliminar
      const result = await client.query(
        'DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, email',
        [id],
      );

      // Usar helper para sanitizar
      const oldUserSafe = sanitizeForAudit('usuario', oldUser);
      await auditDelete(req, 'usuario', oldUserSafe);

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
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    // Usar helper para auditar
    const oldUser = await getOldValuesForAudit('usuario', 'id_usuario', id);

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const result = await client.query(
      `UPDATE usuario
       SET activo = false, deleted_at = NOW()
       WHERE id_usuario = $1
       RETURNING id_usuario, email`,
      [id],
    );

    // Usar helper para sanitizar
    const oldUserSafe = sanitizeForAudit('usuario', oldUser);
    await auditDelete(req, 'usuario', oldUserSafe);

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
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    // Usar helper para auditar
    const oldUser = await getOldValuesForAudit('usuario', 'id_usuario', id);

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    const result = await client.query(
      `UPDATE usuario
       SET activo = true, deleted_at = NULL
       WHERE id_usuario = $1
       RETURNING id_usuario, email, activo`,
      [id],
    );

    // Auditar reactivacion como CREATE
    const newValues = { activo: true, deleted_at: null };
    await auditCreate(req, 'usuario', id, newValues);

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
  const { token, plataforma } = req.body;
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
      message: 'Dispositivo registrado exitosamente.',
    });
  } catch (error) {
    next(error);
  }
};
