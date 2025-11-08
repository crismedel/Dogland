// src/hooks/usePushTokenRegistration.tsx
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { buildAndRegisterPushToken } from '@/src/api/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenResult = {
  token?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  deviceId?: string | null;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Hook: registra el push token en el backend con metadata (platform, deviceId, appVersion).
 *
 * @param isAuthenticated - si el usuario está autenticado
 * @param userId - opcional, id del usuario para enviar al backend (si lo necesitas)
 */
export function usePushTokenRegistration(
  isAuthenticated: boolean,
  userId?: string | number | null,
) {
  useEffect(() => {
    let mounted = true;
    let appStateListener: { remove?: () => void } | null = null;

    async function attemptRegister(tokenResult: TokenResult) {
      if (!tokenResult || !tokenResult.token) return;

      try {
        // Obtener preferencias de AsyncStorage
        const marketing = await AsyncStorage.getItem('notif_marketing');
        const system = await AsyncStorage.getItem('notif_system');

        const preferences = {
          marketing: marketing === '1',
          system: system === '1',
        };

        const lastRegistered = await SecureStore.getItemAsync(
          'last_registered_push_token',
        );

        // Si el token es el mismo, actualizamos el item para mantener metadata si cambió
        if (tokenResult.token === lastRegistered) {
          await SecureStore.setItemAsync(
            'last_registered_push_token',
            tokenResult.token,
          );
          return;
        }

        const maxAttempts = 3;
        let attempt = 0;
        let registered = false;

        while (attempt < maxAttempts && !registered) {
          try {
            // Pasamos metadata (tokenResult puede venir con platform/appVersion/deviceId)
            await buildAndRegisterPushToken(tokenResult.token, {
              platform: tokenResult.platform ?? null,
              app_version: tokenResult.appVersion ?? null,
              device_id: tokenResult.deviceId ?? null,
              user_id: userId ?? null,
              preferences, // Incluir preferencias
            });

            await SecureStore.setItemAsync(
              'last_registered_push_token',
              tokenResult.token,
            );

            registered = true;
            console.log(
              '✅ Push token registrado en backend en intento',
              attempt + 1,
            );
          } catch (err: any) {
            attempt += 1;
            const status = err?.response?.status ?? null;
            const backendMsg = err?.response?.data ?? err?.message ?? null;

            // Si el backend rechaza el token (400), lo borramos localmente y no reintentamos
            if (status === 400) {
              console.warn(
                'Backend rechazó push token (400). Eliminando localmente y sin reintentos.',
                backendMsg,
              );
              await SecureStore.deleteItemAsync('last_registered_push_token');
              registered = true;
              break;
            }

            console.warn(
              'Error registrando push token, intento',
              attempt,
              err?.message ?? err,
            );

            const backoffMs = 500 * Math.pow(2, attempt - 1);
            await wait(backoffMs);
          }
        }

        if (!registered) {
          console.warn(
            'No se pudo registrar push token tras varios intentos. Se intentará de nuevo en próxima reanudación.',
          );
        }
      } catch (outerErr) {
        console.warn('Error en attemptRegister (outer):', outerErr);
      }
    }

    const registerToken = async () => {
      try {
        // Expo EAS projectId si aplica
        const projectId =
          (Constants as any)?.expoConfig?.extra?.eas?.projectId ||
          (Constants as any)?.easConfig?.projectId ||
          undefined;

        const tokenResult = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : {},
        );

        const token =
          (tokenResult as any).data ?? (tokenResult as any).token ?? null;
        if (!token) {
          console.debug('No se obtuvo Expo push token al registrar.');
          return;
        }

        // Construir metadata localmente (usar Platform.OS y Device con casteo para evitar TS errors)
        const platform = Platform.OS;
        const deviceId =
          (Device as any)?.modelName ??
          (Device as any)?.deviceName ??
          (Device as any)?.osBuildId ??
          null;
        const appVersion =
          (Constants as any)?.expoConfig?.version ??
          (Constants as any)?.manifest?.version ??
          null;

        await attemptRegister({
          token,
          platform,
          deviceId,
          appVersion,
        });
      } catch (err) {
        console.warn('Error en registro automático de push token:', err);
      }
    };

    if (isAuthenticated && mounted) {
      registerToken();
      // Re-intentar al volver de background
      appStateListener = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active' && isAuthenticated) {
          registerToken();
        }
      });
    }

    return () => {
      mounted = false;
      if (appStateListener && typeof appStateListener.remove === 'function') {
        appStateListener.remove();
      }
    };
  }, [isAuthenticated, userId]);
}

/**
 * Inicializa el handler de notificaciones en foreground.
 * Actualmente está configurado para NO mostrar alert nativa (usar toasts).
 */
export function initNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}
