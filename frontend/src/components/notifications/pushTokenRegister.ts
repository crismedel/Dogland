import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { buildAndRegisterPushToken } from '@/src/api/notifications';

type TokenResult = {
  token?: string | null;
  platform?: string | null;
  appVersion?: string | null;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function usePushTokenRegistration(
  isAuthenticated: boolean,
  userId?: string | number | null,
) {
  useEffect(() => {
    let mounted = true;
    let appStateListener: { remove?: () => void } | null = null;

    async function attemptRegister(tokenResult: TokenResult) {
      if (!tokenResult || !tokenResult.token) return;
      const lastRegistered = await SecureStore.getItemAsync(
        'last_registered_push_token',
      );
      if (tokenResult.token === lastRegistered) {
        // Re-save in case metadata/format changed
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
          await buildAndRegisterPushToken(tokenResult.token);
          await SecureStore.setItemAsync(
            'last_registered_push_token',
            tokenResult.token,
          );
          registered = true;
          console.log(
            '✅ Push token registrado (backend) en intento',
            attempt + 1,
          );
        } catch (err: any) {
          attempt += 1;
          const status = err?.response?.status ?? null;
          const backendMsg = err?.response?.data ?? err?.message ?? null;
          if (status === 400) {
            console.warn(
              'Backend rechazó push token (400). Eliminando localmente y sin reintentos.',
              backendMsg,
            );
            await SecureStore.deleteItemAsync('last_registered_push_token');
            registered = true; // stop
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
    }

    const registerToken = async () => {
      try {
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
        await attemptRegister({ token });
      } catch (err) {
        console.warn('Error en registro automático de push token:', err);
      }
    };

    if (isAuthenticated && mounted) {
      registerToken();
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
