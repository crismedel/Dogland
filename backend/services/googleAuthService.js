import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../config/env.js';

// Crear unica instancia del cliente de OAuth2
// No es necesario crearlo en cada llamada a la funcion
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifica un idToken de Google y retorna el payload.
 * @param {string} idToken - El token de ID recibido del cliente (movil).
 * @returns {Promise<object>} El payload del token si es válido.
 * @throws {Error} Lanza un error si el token es inválido o la verificacion falla.
 */
export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('No se pudo obtener el payload del token de Google');
    }

    // Devolver payload con la informacion del usuario
    return payload;

  } catch (error) {
    console.error('Error al verificar el token de Google:', error.message);
    // Relanzamos un error claro para que el controlador lo maneje
    throw new Error('Token de Google inválido');
  }
};