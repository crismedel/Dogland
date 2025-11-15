import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { Animated, AccessibilityInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import {
  createId,
  initAnim,
  animateIn,
  animateOut,
  setTimer,
  clearTimer,
  deleteAnim,
  clearAllTimers,
} from './toastManager';
import {
  usePushTokenRegistration,
  initNotificationHandler,
} from './pushTokenRegister';
import type {
  ToastOptions,
  ConfirmOptions,
  RequiredToast,
  NotificationContextType,
} from './types';
import { useAuth } from '@/src/contexts/AuthContext';

// Context + hook
const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

type ProviderProps = { children: React.ReactNode };

const DEFAULT_DURATION = 3000;

const NotificationProvider: React.FC<ProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<RequiredToast[]>([]);
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { visible: boolean }) | null
  >(null);

  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();

  // Push token registration logic (encapsulado en hook)
  usePushTokenRegistration(isAuthenticated, user?.id);

  useEffect(() => {
    initNotificationHandler();
  }, []);

  // LISTENERS: notifications received & response
  useEffect(() => {
    const notificationReceivedListener =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;
        showToast({
          type: 'info',
          title: (title as string) ?? 'Notificación',
          message: (body as string) ?? '',
          position: 'top',
        });
      });

    const notificationResponseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { notification } = response;
        const rawData = (notification.request.content as any).data ?? {};
        const type =
          rawData.type || rawData.eventType || rawData.notificationType || null;
        const id =
          rawData.alert_id ??
          rawData.alertId ??
          rawData.id ??
          rawData.resource_id ??
          null;
        try {
          if ((type === 'alerta' || type === 'alert') && id != null) {
            router.push({
              pathname: '/alerts/detail-alert',
              params: { id: String(id) },
            });
          } else if (type === 'avistamiento' && id) {
            router.push(`/sightings/${String(id)}`);
          } else if (type === 'solicitud' && id) {
            router.push('/settings/notifications');
          } else {
            router.push('/settings/notifications');
          }
        } catch (err) {
          console.warn('Error navegando desde notificación:', err);
          router.push('/settings/notifications');
        }
      });

    return () => {
      notificationReceivedListener.remove();
      notificationResponseListener.remove();
    };
  }, []);

  // Toast handlers
  const dismissToast = useCallback((id?: string) => {
    if (!id) {
      setToasts([]);
      clearAllTimers();
      return;
    }

    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (!toast) return prev;

      const anim = initAnim(id);
      // animate out then remove
      animateOut(anim, () => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
        deleteAnim(id);
      });

      // clear timer
      clearTimer(id);
      return prev;
    });
  }, []);

  const showToast = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id ?? createId();
      const toast: RequiredToast = {
        id,
        type: opts.type ?? 'info',
        title: opts.title,
        message: opts.message ?? '',
        durationMs: opts.durationMs ?? DEFAULT_DURATION,
        actionLabel: opts.actionLabel ?? '',
        onActionPress: opts.onActionPress ?? (() => {}),
        position: opts.position ?? 'top',
        underHeader: opts.underHeader ?? true,
        tabBarHeight: opts.tabBarHeight ?? 0,
        dismissible: opts.dismissible ?? true,
      };

      setToasts((prev) => [...prev, toast]);

      // init anim and animate in
      const anim = initAnim(id);
      animateIn(anim);

      // accessibility announcement
      const message = `${toast.title}${
        toast.message ? '. ' + toast.message : ''
      }`;
      AccessibilityInfo.announceForAccessibility(message);

      // auto-dismiss
      if (toast.durationMs > 0) {
        setTimer(id, toast.durationMs, () => {
          dismissToast(id);
        });
      }

      return id;
    },
    [dismissToast],
  );

  const updateToast = useCallback((id: string, opts: Partial<ToastOptions>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...opts } : t)));
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState({ ...opts, visible: true });
  }, []);

  const value = useMemo<NotificationContextType>(
    () => ({
      showToast,
      showSuccess: (title, message, opts) =>
        showToast({ type: 'success', title, message, ...(opts ?? {}) }),
      showError: (title, message, opts) =>
        showToast({ type: 'error', title, message, ...(opts ?? {}) }),
      showInfo: (title, message, opts) =>
        showToast({ type: 'info', title, message, ...(opts ?? {}) }),
      showWarning: (title, message, opts) =>
        showToast({ type: 'warning', title, message, ...(opts ?? {}) }),
      dismissToast,
      updateToast,
      confirm,
    }),
    [showToast, dismissToast, updateToast, confirm],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast UI */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          anim={initAnim(toast.id)}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          actionLabel={toast.actionLabel}
          onActionPress={toast.onActionPress}
          onHide={() => dismissToast(toast.id)}
          position={toast.position}
          underHeader={toast.underHeader}
          tabBarHeight={toast.tabBarHeight}
          dismissible={toast.dismissible}
        />
      ))}

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={!!confirmState?.visible}
        title={confirmState?.title ?? ''}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel ?? 'Confirmar'}
        cancelLabel={confirmState?.cancelLabel ?? 'Cancelar'}
        destructive={!!confirmState?.destructive}
        onConfirm={() => {
          confirmState?.onConfirm?.();
          setConfirmState(null);
        }}
        onCancel={() => {
          confirmState?.onCancel?.();
          setConfirmState(null);
        }}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
