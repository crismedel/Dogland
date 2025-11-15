import crypto from 'crypto';
import pool from '../db/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';

/**
 * Genera un código 2FA de 6 dígitos
 * @returns {string} Código de 6 dígitos
 */
export const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Guarda el código 2FA en la base de datos
 * @param {number} userId - ID del usuario
 * @param {string} code - Código 2FA en texto plano
 * @param {number} expirationMinutes - Minutos hasta que expire (por defecto 10)
 */
export const save2FAToken = async (userId, code, expirationMinutes = 10) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hashear el código
    const tokenHash = await hashPassword(code);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Eliminar cualquier token anterior para este usuario
    await client.query(
      'DELETE FROM two_factor_tokens WHERE id_usuario = $1',
      [userId]
    );

    // Insertar nuevo token
    await client.query(
      `INSERT INTO two_factor_tokens (id_usuario, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Verifica un código 2FA
 * @param {number} userId - ID del usuario
 * @param {string} code - Código 2FA proporcionado por el usuario
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export const verify2FACode = async (userId, code) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Buscar el token del usuario
    const result = await client.query(
      `SELECT token_hash, expires_at
       FROM two_factor_tokens
       WHERE id_usuario = $1
       FOR UPDATE`,
      [userId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return { valid: false, message: 'No se encontró código 2FA para este usuario' };
    }

    const { token_hash, expires_at } = result.rows[0];

    // Verificar si el token ha expirado
    if (new Date(expires_at) < new Date()) {
      // Eliminar token expirado
      await client.query(
        'DELETE FROM two_factor_tokens WHERE id_usuario = $1',
        [userId]
      );
      await client.query('COMMIT');
      return { valid: false, message: 'El código ha expirado' };
    }

    // Comparar el código
    const isValid = await comparePassword(code, token_hash);

    if (!isValid) {
      await client.query('ROLLBACK');
      return { valid: false, message: 'Código inválido' };
    }

    // Si es válido, eliminar el token (un solo uso)
    await client.query(
      'DELETE FROM two_factor_tokens WHERE id_usuario = $1',
      [userId]
    );

    await client.query('COMMIT');
    return { valid: true, message: 'Código verificado correctamente' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Limpia tokens 2FA expirados (ejecutar periódicamente)
 */
export const cleanExpired2FATokens = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM two_factor_tokens WHERE expires_at < NOW()'
    );
    console.log(`🧹 Tokens 2FA expirados eliminados: ${result.rowCount}`);
    return result.rowCount;
  } catch (error) {
    console.error('Error al limpiar tokens 2FA expirados:', error);
    throw error;
  }
};
