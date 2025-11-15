import { Expo } from 'expo-server-sdk';
import * as pushTokens from './pushTokens.js';

const expo = new Expo();

/**
 * Obtiene tokens válidos para una lista de userIds
 * Delegado a pushTokens.getValidTokensByUserIds
 */
export async function getTokensForUsers(userIds) {
  return await pushTokens.getValidTokensByUserIds(userIds);
}

/**
 * Marcar token como inválido en la DB
 */
export async function markTokenInvalid(push_token, reason = null) {
  return await pushTokens.markTokenInvalid(push_token, reason);
}

/**
 * Enviar notificaciones a usuarios (por userIds).
 * - payload: { title, body, data }
 * - userIds: array de ids de usuario
 *
 * NOTA: Esta función envía y guarda tickets (para procesamiento de receipts en worker).
 * No procesa receipts aquí (se hará en worker).
 */
export async function sendPushNotificationToUsers(
  payload,
  userIds,
  notificationType = 'system',
) {
  const tokensRows = await getTokensForUsers(userIds);
  if (!tokensRows || tokensRows.length === 0) {
    console.log('No hay tokens válidos para los usuarios pedidos');
    return { sent: 0, details: [] };
  }

  const messagesMeta = [];
  for (const row of tokensRows) {
    const { user_id, push_token, preferences } = row;

    // Verificar si el token tiene preferencias y si permite este tipo de notificación
    const allowsNotification = preferences
      ? notificationType === 'marketing'
        ? preferences.marketing
        : preferences.system
      : true; // Si no hay preferencias definidas, permitir por defecto

    // Si el usuario ha desactivado este tipo de notificación, saltar
    if (!allowsNotification) {
      console.log(
        `Saltando notificación para token ${push_token} (tipo: ${notificationType})`,
      );
      continue;
    }

    if (!Expo.isExpoPushToken(push_token)) {
      // No invalidamos aquí si queremos soportar otros backends: marcar sólo si somos Expo-only.
      await markTokenInvalid(push_token, 'invalid_expo_token_format');
      continue;
    }

    messagesMeta.push({
      user_id,
      push_token,
      message: {
        to: push_token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        priority: 'high',
        badge: payload.badge || 1,
        channelId: payload.channelId || 'default',
      },
    });
  }

  return await _sendMessagesAndSaveTickets(messagesMeta);
}

/**
 * Enviar notificaciones a tokens concretos
 * - tokensWithMeta: [{ push_token, user_id, preferences }]
 */
export async function sendPushNotificationToTokens(
  payload,
  tokensWithMeta = [],
  notificationType = 'system', // Tipo de notificación por defecto
) {
  const messagesMeta = [];

  for (const t of tokensWithMeta) {
    // Verificar si el token tiene preferencias y si permite este tipo de notificación
    const allowsNotification = t.preferences
      ? notificationType === 'marketing'
        ? t.preferences.marketing
        : t.preferences.system
      : true; // Si no hay preferencias definidas, permitir por defecto

    // Si el usuario ha desactivado este tipo de notificación, saltar
    if (!allowsNotification) {
      console.log(
        `Saltando notificación para token ${t.push_token} (tipo: ${notificationType})`,
      );
      continue;
    }

    if (!Expo.isExpoPushToken(t.push_token)) {
      await markTokenInvalid(t.push_token, 'invalid_expo_token_format');
      continue;
    }

    messagesMeta.push({
      user_id: t.user_id || null,
      push_token: t.push_token,
      message: {
        to: t.push_token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        priority: 'high',
        badge: payload.badge || 1,
        channelId: payload.channelId || 'default',
      },
    });
  }

  return await _sendMessagesAndSaveTickets(messagesMeta);
}

/**
 * Internal: enviar chunks y guardar tickets (no procesa receipts).
 */
async function _sendMessagesAndSaveTickets(messagesMeta) {
  if (!messagesMeta.length) return { sent: 0, targets: 0 };

  const messages = messagesMeta.map((m) => m.message);
  const chunks = expo.chunkPushNotifications(messages);
  let sentCount = 0;
  const details = [];

  let offset = 0;
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      // ticketChunk aligns with chunk messages
      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];
        const meta = messagesMeta[offset + i];

        details.push({
          push_token: meta.push_token,
          user_id: meta.user_id,
          ticket,
        });

        // Si expo devolvió un id, guardamos ticket para receipts async
        if (ticket && ticket.id) {
          try {
            await pushTokens.saveTicket(
              ticket.id,
              meta.push_token,
              meta.user_id,
            );
          } catch (err) {
            console.warn('Could not save ticket:', err);
          }
          // contar como "aceptado" por Expo (server accepted)
          sentCount += 1;
        } else if (ticket && ticket.status === 'error') {
          // error inmediato (por ejemplo: invalid token format)
          const errCode = ticket.details && ticket.details.error;
          if (
            errCode === 'DeviceNotRegistered' ||
            errCode === 'InvalidCredentials' ||
            errCode === 'InvalidDeviceToken'
          ) {
            await markTokenInvalid(meta.push_token, errCode);
          }
          // No incrementamos sentCount
        } else {
          // sin id ni error: tratamos como no confirmado; no incrementamos sentCount
        }
      }
    } catch (err) {
      console.error('Error enviando chunk de notificaciones:', err);
      // Puedes planear reintentos aquí (backoff) desde un worker/cola
    }
    offset += chunk.length;
  }

  return {
    sent: sentCount,
    targets: messagesMeta.length,
    details,
  };
}

export default {
  sendPushNotificationToUsers,
  sendPushNotificationToTokens,
  markTokenInvalid,
  getTokensForUsers,
};
