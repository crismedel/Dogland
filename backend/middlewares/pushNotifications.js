// src/middlewares/pushNotifications.js
import { Expo } from 'expo-server-sdk';
import * as pushService from '../services/pushService.js';
import * as pushTokens from '../services/pushTokens.js';

const expo = new Expo();

/**
 * Envía notificaciones push a una lista de tokens Expo.
 *
 * @param {string} title
 * @param {string} body
 * @param {string[]|Object[]} tokensOrEntries - Array de tokens (strings) o array de objetos { token, dispositivoId?, usuarioId? }.
 * @param {Object} [data={}] - Payload adicional que recibirá la app.
 * @returns {Object} resumen { sent, ticketsCount, invalidTokens: [] }
 */
export async function sendPushNotificationToUsers(
  title,
  body,
  tokensOrEntries = [],
  data = {},
) {
  if (!tokensOrEntries || tokensOrEntries.length === 0) {
    return { sent: 0, ticketsCount: 0, invalidTokens: [] };
  }

  // Normalizar entradas a objetos { token, user_id? }
  const entries = tokensOrEntries.map((t) =>
    typeof t === 'string' ? { token: t } : t,
  );

  const tokensWithMeta = entries.map((e) => ({
    push_token: e.token,
    user_id: e.usuarioId || e.user_id || e.id_usuario || null,
  }));

  // Delegar al servicio que guarda tickets
  const payload = {
    title,
    body,
    data,
  };

  const result = await pushService.sendPushNotificationToTokens(
    payload,
    tokensWithMeta,
  );

  // result.details puede incluir tickets y errores inmediatos
  const invalidTokens = [];

  // Recolectar invalidaciones inmediatas (si alguna)
  if (result.details && result.details.length) {
    for (const d of result.details) {
      const t = d.ticket;
      if (t && t.status === 'error') {
        const err = t.details && t.details.error;
        if (
          err === 'DeviceNotRegistered' ||
          err === 'InvalidCredentials' ||
          err === 'InvalidDeviceToken'
        ) {
          invalidTokens.push(d.push_token);
          // marcar en db (ya lo debería hacer pushService, pero por seguridad redundante)
          try {
            await pushTokens.markTokenInvalid(d.push_token, err);
          } catch (e) {
            console.warn('Could not mark token invalid (middleware):', e);
          }
        }
      }
    }
  }

  return {
    sent: result.sent,
    ticketsCount: result.details ? result.details.length : 0,
    invalidTokens,
  };
}

export default {
  sendPushNotificationToUsers,
};
