import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import apiClient from '../../api/client';

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS,
  );
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('No se pudo obtener permiso para notificaciones');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function savePushToken(
  userId: number,
  token: string,
): Promise<void> {
  try {
    await apiClient.post('/users/savePushToken', { userId, token });
  } catch (error: any) {
    console.error(
      'API savePushToken error:',
      error.response?.data || error.message || error,
    );
    throw error.response?.data || error;
  }
}

export default function PushTokenRegistrar({ userId }: { userId: number }) {
  useEffect(() => {
    async function saveToken() {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      await savePushToken(userId, token);
    }
    saveToken();
  }, [userId]);

  return null; // No UI
}

// usuario logueado faltante definir
// <PushTokenRegistrar userId={usuarioLogueadoId} />;
