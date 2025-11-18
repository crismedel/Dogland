import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotificationApi,
  markAllNotificationsRead,
  NotificationItem,
} from '@/src/api/notifications';
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { checkAlertExists } from '@/src/api/alerts';
import { checkSightingExists } from '@/src/api/sightings';
import NotificationOptionsModal from './NotificationOptionsModal';
import Spinner from '@/src/components/UI/Spinner';
import { AppText } from '@/src/components/AppText'; // Importar AppText

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

const PAGE_SIZE = 20;

function parseData(maybe: unknown) {
  if (maybe == null) return null;
  if (typeof maybe === 'string') {
    try {
      return JSON.parse(maybe);
    } catch {
      return maybe;
    }
  }
  return maybe;
}

function normalizeItem(raw: NotificationItem): NotificationItem {
  return {
    ...raw,
    data: parseData((raw as any).data ?? (raw as any).metadata ?? null),
  } as NotificationItem;
}

function relativeTimeLabel(date?: Date | null) {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'hace unos segundos';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return date.toLocaleDateString();
}

type RowProps = {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onLongPress: (item: NotificationItem) => void;
};

const NotificationRow = React.memo(
  ({ item, onPress, onLongPress }: RowProps) => {
    // 3. Llamar al hook y generar los estilos
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const created = item.created_at ? new Date(item.created_at) : null;

    const iconName = (() => {
      const type = item.type?.toLowerCase();
      if (type?.includes('alert')) return 'alert-circle-outline';
      if (type?.includes('avist')) return 'paw-outline';
      if (type?.includes('adop')) return 'heart-outline';
      return 'notifications-outline';
    })();

    return (
      <Pressable
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress(item)}
        style={({ pressed }) => [
          styles.card,
          !item.read && styles.cardUnread,
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        ]}
      >
        <View style={styles.iconContainer}>
          {/* 4. Usar colores del tema */}
          <Ionicons name={iconName as any} size={26} color={colors.secondary} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title ?? 'Notificación'}
          </Text>
          {item.body ? (
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
          ) : null}
          <Text style={styles.meta}>{relativeTimeLabel(created)}</Text>
        </View>

        {!item.read && (
          <View style={styles.badgeNew}>
            <Text style={styles.badgeText}>Nuevo</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

NotificationRow.displayName = 'NotificationRow';

export default function NotificationsScreen() {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const { showError, showSuccess, confirm } = useNotification();

  // Avoid multiple onEndReached triggers
  const onEndReachedCalledDuringMomentum = useRef(false);

  const load = useCallback(
    async (p = 1) => {
      if (p === 1) {
        setHasMore(true);
        setTotal(null);
      }

      try {
        if (p === 1) setLoading(true);
        else setLoadingMore(true);

        const res = await fetchNotifications(p, PAGE_SIZE);
        const rows: NotificationItem[] = Array.isArray(res.rows)
          ? res.rows.map(normalizeItem)
          : [];
        const count: number | undefined = res.pagination?.total;

        setItems((prev) => (p === 1 ? rows : [...prev, ...rows]));

        if (typeof count === 'number') {
          setTotal(count);
          setHasMore((p - 1) * PAGE_SIZE + rows.length < count);
        } else {
          setHasMore(rows.length === PAGE_SIZE);
        }

        setPage(p);
      } catch (err) {
        console.warn('Error cargando notificaciones', err);
        showError?.('Error', 'No se pudieron cargar notificaciones');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [showError],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const next = page + 1;
    await load(next);
  }, [page, load, loadingMore, loading, hasMore]);

  const onPressItem = useCallback(
    async (item: NotificationItem) => {
      const data = (item as any).data ?? {};
      const type =
        (data && (data.type || data.eventType || data.notificationType)) ||
        item.type ||
        null;

      // optimistic
      if (!item.read) {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, read: true } : x)),
        );
        try {
          await markNotificationAsRead(item.id);
        } catch (err) {
          console.warn('Error marcando notificación como leída', err);
          setItems((prev) =>
            prev.map((x) => (x.id === item.id ? { ...x, read: false } : x)),
          );
        }
      }

      try {
        if (type === 'alert' || type === 'alerta') {
          const id = data.alert_id ?? data.alertId ?? data.id ?? null;
          if (id) {
            const exists = await checkAlertExists(Number(id));
            if (exists) {
              router.push({
                pathname: '/alerts/detail-alert',
                params: { id: String(id) },
              });
            } else {
              showError?.('Alerta no disponible', 'La alerta ya fue eliminada.');
            }
          } else {
            router.push('/settings/notifications');
          }
        } else if (type === 'avistamiento' || type === 'sighting') {
          const sightingId = data.sighting_id ?? data.id ?? null;
          if (sightingId) {
            const exists = await checkSightingExists(Number(sightingId));
            if (exists) {
              router.push({
                pathname: '/sightings/[id]',
                params: { id: String(sightingId) },
              });
            } else {
              showError?.(
                'Avistamiento no disponible',
                'El avistamiento fue eliminado.',
              );
            }
          } else {
            router.push('/settings/notifications');
          }
        } else {
          router.push('/settings/notifications');
        }
      } catch (err) {
        console.warn('Error navegando desde notificación', err);
      }
    },
    [showError],
  );

  const onDelete = useCallback(
    (item: NotificationItem) => {
      confirm({
        title: 'Eliminar notificación',
        message: '¿Deseas eliminar esta notificación?',
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        destructive: true,
        onConfirm: async () => {
          try {
            // Eliminación local optimista
            setItems((prev) => prev.filter((x) => x.id !== item.id));

            // Para eliminar en la base de datos:
            await deleteNotificationApi(item.id);

            showSuccess?.('Eliminada', 'Notificación eliminada');
          } catch (err) {
            console.warn('Error eliminando notificación', err);
            showError?.('Error', 'No se pudo eliminar la notificación');
            await load(1);
          }
        },
      });
    },
    [load, showError, showSuccess, confirm],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      showSuccess?.('Listo', 'Todas las notificaciones marcadas como vistas');
      await load(1);
    } catch (err) {
      showError?.('Error', 'No se pudieron marcar todas como vistas');
    }
    setOptionsVisible(false);
  }, [load, showError, showSuccess]);

  const deleteAllNotifications = useCallback(() => {
    confirm({
      title: 'Eliminar todas las notificaciones',
      message: '¿Estás seguro de eliminar todas las notificaciones?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          // Eliminación local:
          setItems([]);

          // Para eliminar en la base de datos, descomenta esta parte:
          /*
          await Promise.all(
            items.map((item) => deleteNotificationApi(item.id)),
          );
          await load(1);
          */

          showSuccess?.(
            'Eliminadas',
            'Todas las notificaciones fueron eliminadas localmente',
          );
        } catch (err) {
          showError?.(
            'Error',
            'No se pudieron eliminar todas las notificaciones',
          );
        }
        setOptionsVisible(false);
      },
    });
  }, [items, showError, showSuccess, confirm]);

  const deleteSelectedNotifications = useCallback(
    async (selectedIds: number[]) => {
      if (selectedIds.length === 0) return;
      confirm({
        title: 'Eliminar notificaciones seleccionadas',
        message: `¿Eliminar ${selectedIds.length} notificación(es)?`,
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar',
        destructive: true,
        onConfirm: async () => {
          try {
            // Eliminación local:
            setItems((prev) =>
              prev.filter((item) => !selectedIds.includes(item.id)),
            );

            // Para eliminar en la base de datos:
            await Promise.all(
              selectedIds.map((id) => deleteNotificationApi(id)),
            );
            // await load(1); // Recargar si es necesario

            showSuccess?.('Eliminadas', 'Notificaciones eliminadas localmente');
          } catch (err) {
            showError?.('Error', 'No se pudieron eliminar las notificaciones');
          }
        },
      });
    },
    [showError, showSuccess, confirm],
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationRow
        item={item}
        onPress={onPressItem}
        onLongPress={onDelete}
      />
    ),
    [onPressItem, onDelete],
  );

  const renderEmpty = () => {
    if (loading) return <Spinner />;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No hay notificaciones</Text>
        <Pressable
          onPress={() => load(1)}
          style={({ pressed }) => [
            styles.reloadButton,
            pressed ? styles.reloadPressed : null,
          ]}
        >
          <Text style={styles.reloadText}>Recargar</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="notificaciones"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {/* 4. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => setOptionsVisible(true)}>
            {/* 4. Usar colores del tema (texto oscuro sobre fondo amarillo) */}
            <Ionicons
              name="options-outline"
              size={24}
              color={isDark ? colors.lightText : colors.text}
            />
          </TouchableOpacity>
        }
      />
      {loading && items.length === 0 ? (
        <Spinner />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]} // 4. Usar colores del tema
              tintColor={colors.primary} // Para iOS
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!onEndReachedCalledDuringMomentum.current) {
              loadMore();
              onEndReachedCalledDuringMomentum.current = true;
            }
          }}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
          contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
        />
      )}

      <NotificationOptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onMarkAllRead={markAllAsRead}
        onDeleteAll={deleteAllNotifications}
        onDeleteSelected={deleteSelectedNotifications}
        notifications={items}
      />
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background }, // Dinámico
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
      flexDirection: 'row',
      padding: 16,
      marginHorizontal: 14,
      marginVertical: 8,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecon, // Dinámico
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    cardUnread: {
      borderWidth: 2,
      borderColor: colors.secondary, // Dinámico
    },
    iconContainer: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: { flex: 1, marginLeft: 8 },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text, // Dinámico
      marginBottom: 4,
    },
    body: {
      fontSize: 14,
      color: colors.darkGray, // Dinámico
      marginBottom: 6,
    },
    meta: {
      fontSize: 12,
      color: colors.accent, // Dinámico
      marginTop: 4,
    },
    badgeNew: {
      backgroundColor: colors.secondary, // Dinámico
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    badgeText: {
      fontSize: 11,
      // 4. Usar colores del tema (texto claro/oscuro sobre fondo naranja)
      color: isDark ? colors.text : colors.lightText,
      fontWeight: '600',
    },

    // Estilos antiguos/posiblemente no usados (refactorizados por si acaso)
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      marginHorizontal: 12,
      marginVertical: 6,
      borderRadius: 10,
      backgroundColor: colors.primary, // Dinámico
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        android: {
          elevation: 2,
        },
      }),
    },
    itemPressed: { opacity: 0.9 },
    itemRead: { backgroundColor: colors.primary }, // Dinámico
    itemUnread: { backgroundColor: colors.background }, // Dinámico
    rowLeft: { width: 24, alignItems: 'center', marginTop: 6 },
    unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary, // Dinámico
    },
    unreadPlaceholder: { width: 10, height: 10, borderRadius: 5, opacity: 0 },
    rowBody: { flex: 1, paddingHorizontal: 8 },
    rowRight: { width: 68, alignItems: 'flex-end' },
    preview: { fontSize: 12, color: colors.darkGray }, // Dinámico

    // Estilos de Empty/Footer
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyEmoji: { fontSize: 42, marginBottom: 8 },
    emptyText: { color: colors.darkGray, fontSize: 16, marginBottom: 12 }, // Dinámico
    reloadButton: {
      backgroundColor: colors.primary, // Dinámico
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    reloadPressed: { opacity: 0.9 },
    reloadText: {
      color: isDark ? colors.lightText : colors.text, // Dinámico
      fontWeight: '600',
    },
    footer: { padding: 12, alignItems: 'center' },
  });