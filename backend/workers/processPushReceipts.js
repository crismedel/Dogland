// src/workers/processPushReceipts.js
/**
 * Worker sencillo para procesar receipts de Expo.
 * Ejemplo: node ../workers/processPushReceipts.js
 */
import { Expo } from 'expo-server-sdk';
import * as pushTokens from '../services/pushTokens.js';

const expo = new Expo();

async function processReceiptsBatch() {
  try {
    const tickets = await pushTokens.getPendingTickets(500);
    if (!tickets || tickets.length === 0) {
      console.log('No pending tickets to process');
      return;
    }

    const receiptIds = tickets.map((t) => t.ticket_id);
    const chunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    for (const chunk of chunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        for (const receiptId of Object.keys(receipts)) {
          const receipt = receipts[receiptId];
          const ticket = tickets.find((t) => t.ticket_id === receiptId);
          if (!ticket) continue;

          if (receipt.status === 'ok') {
            await pushTokens.markTicketProcessed(receiptId, 'ok', receipt);
            continue;
          }

          // receipt.status === 'error'
          const errDetail = receipt?.details?.error;
          console.error('Receipt error for', receiptId, errDetail, receipt);

          // Errores definitivos que requieren marcar token inválido
          const definitiveErrors = new Set([
            'DeviceNotRegistered',
            'InvalidCredentials',
            'InvalidDeviceToken',
            'Unregistered',
          ]);

          if (
            errDetail &&
            (definitiveErrors.has(errDetail) ||
              errDetail.toLowerCase().includes('notregistered'))
          ) {
            // marcar token inválido
            try {
              await pushTokens.markTokenInvalid(ticket.push_token, errDetail);
            } catch (errMark) {
              console.warn('Error marcando token inválido:', errMark);
            }
            await pushTokens.markTicketProcessed(receiptId, 'error', receipt);
          } else {
            // transitorio o desconocido -> marcar processed con detalles y planear reintento o investigación
            await pushTokens.markTicketProcessed(
              receiptId,
              'error_transient',
              receipt,
            );
          }
        }
      } catch (err) {
        console.error('Error obteniendo receipts chunk:', err);
        // Si falla, continuar con siguiente chunk
      }
    }
  } catch (err) {
    console.error('Error en processReceiptsBatch:', err);
  }
}

// Si se ejecuta como script directo, procesar una vez y salir
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await processReceiptsBatch();
    process.exit(0);
  })();
}

// Export para invocar desde un scheduler
export { processReceiptsBatch };
