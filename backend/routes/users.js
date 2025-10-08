import express from 'express';
import pool from '../db/db.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import {
  createUserSchema,
  updateUserSchema,
  paramsSchema,
  savePushTokenSchema
} from '../schemas/user.js';

const router = express.Router();


// GET /api/users - Listar todos los usuarios
router.get(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  async (req, res) => {
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
      res.status(500).json({ 
        success: false, 
        error: 'Error interno al obtener usuarios' 
      });
    }
  }
);


// GET /api/users/profile - obtener datos del usuario logeado
router.get(
  '/users/profile',
  authenticateToken,
  async (req, res) => {
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

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno al obtener perfil' });
    }
  }
);


// GET /api/users/:id - Obtener usuario por ID
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin','Usuario','Trabajador']),
  async (req, res) => {
    try {
      // validacion del parametro de la URL
      const validationResult = paramsSchema.safeParse(req.params);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: validationResult.error.issues.map(issue => issue.message).join(', '),
        });
      }

      const { id: validatedId } = validationResult.data;

      // Verifica si no es admin y el id no coincide
      if (req.user.role !== 'Admin' && req.user.id !== validatedId) {
        // 403 Forbidden
        return res.status(403).json({
          success: false,
          error: 'No tienes permiso para acceder a este recurso.',
        });
      }

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
        [validatedId],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Error interno al obtener usuario por id' 
      });
    }
  },
);


// POST /api/users - Crear usuario
router.post(
  '/users',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(createUserSchema),
  async (req, res) => {
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
        INSERT INTO 
          usuario (nombre_usuario, apellido_paterno, apellido_materno, id_sexo, 
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

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'El email ya está registrado',
        });
      }
      console.error('Error creando usuario:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno al crear usuario' 
      });
    }
  }
);


// PUT /api/users/:id - Actualizar usuario
router.put(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  validateSchema(updateUserSchema),
  async (req, res) => {
    try {
      const paramsValidation = paramsSchema.safeParse(req.params);

      if (!paramsValidation.success) {
        return res.status(400).json({ success: false, error: 'ID de usuario inválido.' });
      }
      const { id: id } = paramsValidation.data;

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
      res.status(500).json({ 
        success: false, 
        error: 'Error interno al actualizar usuario' 
      });
    }
  },
);


// DELETE /api/users/:id - Borrar usuario controlado
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRol(['Admin']),
  async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // TODO: Borrar dependencias no criticas
      /// ...

      // Borrar usuario y retornar id/email
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

      console.error('Error borrando usuario:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno al borrar usuario' 
      });

    } finally {
      client.release();
    }
  }
);


// PATCH /api/users/:id/deactivate - Desactivar usuario
router.patch(
  '/users/:id/deactivate',
  authenticateToken,
  authorizeRol(['Admin']),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
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
      console.error('Error desactivando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al desactivar usuario'
      });
    }
  }
);


// PATCH /api/users/:id/activate - Activar usuario
router.patch(
  '/users/:id/activate',
  authenticateToken,
  authorizeRol(['Admin']),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE usuario
         SET activo = true, deleted_at = NULL
         WHERE id_usuario = $1
         RETURNING id_usuario, email, activo`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      res.json({
        success: true,
        message: 'Usuario activado correctamente',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error activando usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al activar usuario'
      });
    }
  }
);


// POST /api/users/savePushToken - guardar token push
router.post(
  '/users/savePushToken',
  authenticateToken,
  authorizeRol(['Admin','Usuario', 'Trabajador']),
  validateSchema(savePushTokenSchema),
  async (req, res) => {
    //Recibir desde el body y desde el jwt
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
      console.error('Error guardando token push:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar el dispositivo'
      });
    }
  },
);

export default router;
