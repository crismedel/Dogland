// src/api/notifications.ts
import client from './client'; // tu instancia axios configurada con baseURL + auth interceptor
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface NotificationItem {
  id: number;
  user_id?: number;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  data?: any;
  metadata?: any;
  read?: boolean;
  created_at?: string;
  read_at?: string | null;
}

export interface Pagination {
  limit: number;
  offset: number;
  total?: number;
}

export interface FetchNotificationsResult {
  rows: NotificationItem[];
  pagination?: Pagination | null;
}

/**
 * Payload para registrar push token en el backend.
 */
export interface PushTokenPayload {
  push_token: string;
  platform?: string | null;
  app_version?: string | null;
  device_id?: string | null;
  user_id?: string | number | null;
}

/**
 * Registrar token (POST).
 * Backend: POST /notifications/token
 */
export const registerPushToken = async (payload: PushTokenPayload) => {
  return client.post('/notifications/token', payload);
};

/**
 * buildAndRegisterPushToken:
 * - pushToken: token de expo (string)
 * - opts: metadata opcional (platform, app_version, device_id, user_id)
 */
export const buildAndRegisterPushToken = async (
  pushToken: string,
  opts?: {
    platform?: string | null;
    app_version?: string | null;
    device_id?: string | null;
    user_id?: string | number | null;
  },
) => {
  if (!pushToken) {
    throw new Error('No push token provided');
  }

  const deviceId =
    opts?.device_id ??
    (Device as any)?.modelName ??
    (Device as any)?.deviceName ??
    (Device as any)?.osBuildId ??
    null;

  const appVersion =
    opts?.app_version ??
    (Constants as any)?.expoConfig?.version ??
    (Constants as any)?.manifest?.version ??
    (Constants as any)?.expoConfig?.extra?.appVersion ??
    null;

  const platform = opts?.platform ?? Platform.OS;

  const payload: PushTokenPayload = {
    push_token: pushToken,
    platform: platform ?? null,
    app_version: appVersion ?? null,
    device_id: deviceId ?? null,
    user_id: opts?.user_id ?? null,
  };

  return registerPushToken(payload);
};

/**
 * Eliminar token (DELETE) - body: { push_token }
 * Backend: DELETE /notifications/token
 */
export const deletePushToken = async (push_token: string) => {
  return client.delete('/notifications/token', { data: { push_token } });
};

/**
 * Obtener notificaciones (paginado)
 * Backend: GET /notifications/historial?limit=20&offset=0&read=true|false
 * Respuesta esperada del backend (controller): { success: true, data: [...], pagination: { limit, offset, total } }
 * Normalizamos a { rows, pagination } para consumo en UI.
 */
export const fetchNotifications = async (
  page = 1,
  limit = 20,
  read?: boolean | null,
): Promise<FetchNotificationsResult> => {
  const offset = (page - 1) * limit;
  const params: any = { limit, offset };
  if (read !== undefined && read !== null) {
    // backend espera 'true'|'false' o null
    params.read = String(read);
  }

  const res = await client.get('/notifications/historial', { params });

  // Si el backend responde con { success, data, pagination }
  if (res.data && res.data.data) {
    return {
      rows: Array.isArray(res.data.data) ? res.data.data : [],
      pagination: res.data.pagination ?? null,
    };
  }

  // Fallback: si responde con array directo o { rows, total }
  if (Array.isArray(res.data)) {
    return { rows: res.data, pagination: null };
  }

  const rows = res.data?.rows ?? [];
  const total = res.data?.total ?? undefined;
  return {
    rows,
    pagination: total !== undefined ? { limit, offset, total } : null,
  };
};

/**
 * Marcar notificación como leída.
 * Backend: PATCH /notifications/:id/read
 */
export const markNotificationAsRead = async (notificationId: number) => {
  const res = await client.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

/**
 * Marcar todas como leídas.
 * Backend: PATCH /notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  const res = await client.patch('/notifications/read-all');
  return res.data;
};

/**
 * Borrar notificación
 * Backend: DELETE /notifications/:id
 */
export const deleteNotificationApi = async (notificationId: number) => {
  const res = await client.delete(`/notifications/${notificationId}`);
  return res.data;
};

/**
 * Obtener alertas activas (banners)
 * Backend: GET /notifications/alertas
 */
export const fetchActiveAlerts = async () => {
  const res = await client.get('/notifications/alertas');
  return res.data;
};

/**
 * Obtener banners activos (si necesitas separado)
 * Backend: GET /notifications/banners
 */
export const fetchBanners = async () => {
  const res = await client.get('/notifications/banners');
  return res.data;
};

/**
 * Obtener estadísticas de notificaciones (opcional)
 * Backend: GET /notifications/estadisticas
 */
export const fetchNotificationsStats = async () => {
  const res = await client.get('/notifications/estadisticas');
  return res.data;
};
