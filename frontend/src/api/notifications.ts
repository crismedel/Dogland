import client from './client';
import { authStorage } from '../utils/authStorage';

export interface PushTokenPayload {
  push_token: string;
}

export const registerPushToken = async (pushToken: string) => {
  const token = await authStorage.getToken();
  return client.post(
    '/notifications/token',
    { push_token: pushToken },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

export const fetchActiveAlerts = async () => {
  const token = await authStorage.getToken();
  return client.get('/notifications/alertas', {
    headers: { Authorization: `Bearer ${token}` },
  });
};
