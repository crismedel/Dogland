import { Expo } from 'expo-server-sdk';
import pool from '../db/db.js';

const expo = new Expo();

export async function sendPushNotificationToUsers(message, userIds) {
  try {
    const res = await pool.query(
      'SELECT push_token FROM usuario WHERE id_usuario = ANY($1) AND push_token IS NOT NULL',
      [userIds],
    );
    const tokens = res.rows
      .map((row) => row.push_token)
      .filter(Expo.isExpoPushToken);

    if (tokens.length === 0) {
      console.log('No hay tokens push válidos para enviar notificaciones');
      return;
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: 'Alerta Importante',
      body: message,
      data: { message },
    }));

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log('Notificaciones push enviadas');
  } catch (error) {
    console.error('Error enviando notificaciones push:', error);
  }
}
