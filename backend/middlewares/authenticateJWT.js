import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import pool from '../db/db.js';

/**
 * Middleware para autenticar requests usando JWT en el header Authorization
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación'
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido'
        });
      }

      throw error;
    }

    // Obtener el usuario de la base de datos
    const result = await pool.query(
      'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
      [decoded.id_usuario]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo'
      });
    }

    // Agregar el usuario al objeto request para usar en las rutas incluye datos del token
    req.user = user;
    req.tokenData = decoded;

    next();
  } catch (error) {
    console.error('Error en authenticateJWT:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al autenticar'
    });
  }
};

/**
 * Middleware opcional - permite requests con o sin token
 * Si hay token valido, agrega req.user, si no, continua sin error
 */
export const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      const result = await pool.query(
        'SELECT * FROM usuario WHERE id_usuario = $1 AND activo = true AND deleted_at IS NULL',
        [decoded.id_usuario]
      );

      const user = result.rows[0];

      if (user) {
        req.user = user;
        req.tokenData = decoded;
      }
    } catch (error) {
      // Si token es invalido continua sin usuario
      console.log('Token inválido en optionalJWT:', error.message);
    }

    next();
  } catch (error) {
    console.error('Error en optionalJWT:', error);
    next();
  }
};

export default authenticateJWT;
