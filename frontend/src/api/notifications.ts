// src/api/notifications.ts
import client from './client';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Payload para registrar push token en el backend.
 */
export interface PushTokenPayload {
  push_token: string;
  platform?: string | null;
  app_version?: string | null;
  device_id?: string | null;
}

/**
 * Registrar token (POST). Recibe el payload completo ya formado.
 * Lanza error si la petición falla.
 */
export const registerPushToken = async (payload: PushTokenPayload) => {
  // logueo útil para depuración (quítalo en producción si quieres)
  return client.post('/notifications/token', payload);
};

/**
 * Helper que construye el payload desde el dispositivo y llama a registerPushToken.
 * Úsalo desde tu NotificationProvider para no repetir la construcción del payload.
 */
export const buildAndRegisterPushToken = async (pushToken: string | null) => {
  if (!pushToken) {
    throw new Error('No push token provided');
  }

  const deviceId =
    // Device.osBuildId no siempre está; usar modelName o identifier si lo prefieres
    (Device && (Device.modelName || Device.deviceName || Device.osBuildId)) ||
    null;

  const appVersion =
    Constants?.expoConfig?.version ??
    Constants?.manifest?.version ??
    Constants?.expoConfig?.extra?.appVersion ??
    null;

  const payload: PushTokenPayload = {
    push_token: pushToken,
    platform: Platform.OS,
    app_version: appVersion,
    device_id: deviceId,
  };

  return registerPushToken(payload);
};

/**
 * Eliminar token (DELETE)
 */
export const deletePushToken = async (push_token: string) => {
  return client.delete('/notifications/token', { data: { push_token } });
};

/**
 * Obtener alertas activas (ejemplo)
 */
export const fetchActiveAlerts = async () => {
  return client.get('/notifications/alerts');
};
