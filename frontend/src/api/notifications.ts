import client from './client';

export interface PushTokenPayload {
  push_token: string;
}

// El token se inyecta automáticamente por el interceptor en client.ts
export const registerPushToken = async (pushToken: string) => {
  return client.post('/notifications/token', { push_token: pushToken });
};

export const fetchActiveAlerts = async () => {
  return client.get('/notifications/alertas');
};
