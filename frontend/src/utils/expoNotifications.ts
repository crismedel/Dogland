// src/utils/expoNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function getExpoPushTokenAsync(projectId?: string): Promise<{
  token: string | null;
  platform: string;
  appVersion?: string;
} | null> {
  try {
    if (!Device.isDevice) {
      alert('⚠️ Las notificaciones push requieren un dispositivo físico real.');
      return null;
    }

    const resolvedProjectId =
      projectId ??
      (Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId ||
        null);

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenObject = await Notifications.getExpoPushTokenAsync(
      resolvedProjectId ? { projectId: resolvedProjectId } : undefined,
    );
    const token = tokenObject?.data ?? null;

    // Android: crear canal (si no existe)
    if (Platform.OS === 'android') {
      const channelId = await Notifications.getNotificationChannelAsync(
        'default',
      );
      if (!channelId) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    const platform = Platform.OS;
    const appVersion =
      Constants?.expoConfig?.version ||
      Constants?.manifest?.version ||
      Constants?.expoConfig?.extra?.appVersion ||
      null;

    return { token, platform, appVersion: appVersion ?? undefined };
  } catch (err) {
    console.warn('Error obteniendo Expo push token:', err);
    return null;
  }
}
