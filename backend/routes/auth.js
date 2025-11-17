import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/db.js';
import { UserCreate, findUserByEmail } from '../models/User.js';
import {
  blacklistToken,
  isTokenBlacklisted,
} from '../middlewares/blacklist.js';
import { authenticateToken } from '../middlewares/auth.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import {
  sendPasswordResetEmail,
  sendAccountConfirmationEmail,
  send2FACodeEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';
import { JWT_SECRET } from '../config/env.js';
import {
  generate2FACode,
  save2FAToken,
  verify2FACode,
} from '../services/twoFactorService.js';

const router = Router();

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
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
    } = req.body;

    if (
      !nombre_usuario ||
      !apellido_paterno ||
      !id_sexo ||
      !fecha_nacimiento ||
      !id_ciudad ||
      !email ||
      !password_hash
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Faltan campos obligatorios' });
    }

    // eliminar este regex al usar validadores como joi o zod
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }

    // Verificar si la ciudad existe
    const cityExists = await pool.query(
      'SELECT id_ciudad FROM ciudad WHERE id_ciudad = $1',
      [id_ciudad],
    );

    if (cityExists.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'La ciudad no existe' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(password_hash);

    // Crear nuevo usuario
    const newUser = await UserCreate({
      nombre_usuario,
      apellido_paterno,
      apellido_materno,
      id_sexo,
      fecha_nacimiento,
      telefono,
      id_ciudad,
      email,
      password_hash: hashedPassword,
      id_rol: 2, // Asignar rol por defecto (usuario estándar)
    });

    // Enviar correo de bienvenida (sin bloquear la respuesta)
    sendWelcomeEmail({ email, nombre_usuario }).catch((err) => {
      console.error('Error enviando correo de bienvenida:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      id: newUser.id_usuario,
    });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !password) {
      return res
        .status(401)
        .json({ success: false, error: 'Credenciales inválidas' });
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario tiene 2FA habilitado
    if (user.has_2fa) {
      // Generar código 2FA
      const code = generate2FACode();

      // Guardar el código hasheado en la base de datos
      await save2FAToken(user.id_usuario, code);

      // Enviar el código por email
      await send2FACodeEmail(user, code);

      return res.json({
        success: true,
        requires2FA: true,
        message: 'Código de verificación enviado a tu email',
        email: user.email, // Para usar en el siguiente paso
      });
    }

    // Si no tiene 2FA, continuar con el flujo normal
    // Obtener el rol del usuario desde la base de datos
    const rolResult = await pool.query(
      'SELECT nombre_rol FROM rol WHERE id_rol = $1',
      [user.id_rol],
    );
    const userRole = rolResult.rows[0].nombre_rol;
    // Payload que contendra el JWT generado
    const payload = {
      id: user.id_usuario,
      role: userRole,
      email: user.email,
    };

    // Incluir el payload en el token JWT
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/verify-2fa - Verificar código 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email y código son requeridos',
      });
    }

    // Buscar el usuario por email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Verificar el código 2FA
    const verification = await verify2FACode(user.id_usuario, code);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        error: verification.message,
      });
    }

    // Si el código es válido, generar el token JWT
    const rolResult = await pool.query(
      'SELECT nombre_rol FROM rol WHERE id_rol = $1',
      [user.id_rol],
    );
    const userRole = rolResult.rows[0].nombre_rol;

    const payload = {
      id: user.id_usuario,
      role: userRole,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Autenticación completada exitosamente',
      token,
    });
  } catch (error) {
    console.error('Error en el endpoint de verify-2fa:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/logout - Cierre de sesión con lista negra
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    await blacklistToken(token);
    res.json({
      success: true,
      message: 'Cierre de sesión exitoso. El token ha sido invalidado.',
    });
  } catch (error) {
    console.error('Error en el endpoint de logout:', error);
    res
      .status(500)
      .json({ success: false, error: 'Error al cerrar la sesión' });
  }
});

// GET /api/auth/verify - Verificar la validez del token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    user: req.user,
  });
});

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, error: 'El email es requerido' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          'Si el correo electrónico existe, se ha enviado un enlace de restablecimiento de contraseña.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutos * 60 segundos * 1000 milisegundos

    await pool.query(
      `INSERT INTO password_reset (id_usuario, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id_usuario, token, expiresAt],
    );

    await sendPasswordResetEmail(user, token);

    console.log(`Correo de recuperación enviado para ${email}`);
    res.status(200).json({
      success: true,
      message:
        'Si el correo electrónico existe, se ha enviado un enlace de restablecimiento de contraseña.',
    });
  } catch (error) {
    console.error('Error en el endpoint de forgot-password:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/reset-password - Confirmar cambio de contraseña
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: 'El token y la nueva contraseña son requeridos.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Buscar token valido y no usado en la tabla password_reset
    const resetResult = await client.query(
      `SELECT id_usuario, expires_at, used
             FROM password_reset
             WHERE token = $1 FOR UPDATE`, // FOR UPDATE para evitar race conditions
      [token],
    );

    if (resetResult.rows.length === 0) {
      throw new Error('TOKEN_INVALID');
    }

    const reset = resetResult.rows[0];

    // Validar expiracion y uso
    if (reset.used) {
      throw new Error('TOKEN_USED');
    }
    if (new Date(reset.expires_at) < new Date()) {
      throw new Error('TOKEN_EXPIRED');
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña en la tabla de usuarios
    await client.query(
      `UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2`,
      [hashedPassword, reset.id_usuario],
    );

    // Marcar token como usado para que no se pueda reutilizar
    await client.query(
      `UPDATE password_reset SET used = TRUE WHERE token = $1`,
      [token],
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (error) {
    await client.query('ROLLBACK');

    // Manejo de errores específicos
    if (error.message === 'TOKEN_INVALID') {
      return res.status(400).json({
        success: false,
        message: 'El token proporcionado no es válido.',
      });
    }
    if (error.message === 'TOKEN_USED') {
      return res.status(400).json({
        success: false,
        message: 'Este enlace de recuperación ya ha sido utilizado.',
      });
    }
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(400).json({
        success: false,
        message:
          'El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.',
      });
    }

    console.error('Error en /reset-password:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error interno del servidor.' });
  } finally {
    client.release();
  }
});

// POST /api/auth/toggle-2fa - Activar/desactivar autenticación de dos factores
router.post('/toggle-2fa', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { enable } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado.',
      });
    }

    if (typeof enable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo "enable" debe ser un booleano.',
      });
    }

    // Actualizar el campo has_2fa del usuario
    await pool.query(
      'UPDATE usuario SET has_2fa = $1 WHERE id_usuario = $2',
      [enable, userId]
    );

    res.json({
      success: true,
      message: enable
        ? 'Autenticación de dos factores activada correctamente.'
        : 'Autenticación de dos factores desactivada correctamente.',
      has_2fa: enable,
    });
  } catch (error) {
    console.error('Error en /toggle-2fa:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.',
    });
  }
});

// POST /api/auth/change-password - Cambiar contraseña con sesión iniciada
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    // Extraer las contraseñas del cuerpo de la petición
    const { currentPassword, newPassword } = req.body;

    // Validaciones básicas de entrada
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Faltan campos.' });
    }
    // Regla mínima de seguridad (puedes subirla a 8 o más)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    // Obtener el id del usuario del token (seteado por authenticateToken)
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: 'No autorizado.' });
    }

    // Consultar al usuario en la base de datos para obtener el hash actual
    const userResult = await pool.query(
      'SELECT id_usuario, password_hash FROM usuario WHERE id_usuario = $1',
      [userId],
    );
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Usuario no encontrado.' });
    }
    const user = userResult.rows[0];

    // Verificar que la contraseña actual enviada coincide con el hash guardado
    const ok = await comparePassword(currentPassword, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: 'Contraseña actual incorrecta.' });
    }

    // Hashear la nueva contraseña de forma segura
    const hashed = await hashPassword(newPassword);

    // Guardar el nuevo hash en la base de datos
    await pool.query(
      'UPDATE usuario SET password_hash = $1 WHERE id_usuario = $2',
      [hashed, userId],
    );

    return res.json({ success: true, message: 'Contraseña actualizada.' });
  } catch (err) {
    console.error('Error en /change-password:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error interno del servidor.' });
  }
});

export default router;
