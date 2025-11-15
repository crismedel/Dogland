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
} from 'react-native';
import { router } from 'expo-router';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotificationApi,
  NotificationItem,
} from '@/src/api/notifications';
import { useNotification } from '@/src/components/notifications';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

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
          <Ionicons name={iconName as any} size={26} color={Colors.secondary} />
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
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: fix initial call: load(1) not load(1())
  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(1);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    const next = page + 1;
    await load(next);
  }, [page, load, loadingMore, loading, hasMore]);

  const onPressItem = useCallback(async (item: NotificationItem) => {
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
        if (id)
          router.push({
            pathname: '/alerts/detail-alert',
            params: { id: String(id) },
          });
        else router.push('/settings/notifications');
      } else if (type === 'avistamiento' || type === 'sighting') {
        const sightingId = data.sighting_id ?? data.id ?? null;
        if (sightingId) {
          router.push({
            pathname: '/sightings/[id]',
            params: { id: String(sightingId) },
          });
        } else router.push('/settings/notifications');
      } else {
        router.push('/settings/notifications');
      }
    } catch (err) {
      console.warn('Error navegando desde notificación', err);
    }
  }, []);

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
            // optimistic remove
            setItems((prev) => prev.filter((x) => x.id !== item.id));
            await deleteNotificationApi(item.id);
            showSuccess?.('Eliminada', 'Notificación eliminada');
          } catch (err) {
            console.warn('Error eliminando notificación', err);
            showError?.('Error', 'No se pudo eliminar la notificación');
            // simple recovery: refresh
            await load(1);
          }
        },
      });
    },
    [load, showError, showSuccess],
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
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🔔</Text>
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
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0a84ff']}
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
                <ActivityIndicator />
              </View>
            ) : null
          }
          contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
        />
      )}
    </View>
  );
}

const CARD_BG = Colors.primary;
const UNREAD_BG = '#f0f8ff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecon,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardUnread: {
    borderWidth: 2,
    borderColor: Colors.secondary,
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
    color: Colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 4,
  },
  badgeNew: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    color: Colors.lightText,
    fontWeight: '600',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    // shadow
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
  itemRead: { backgroundColor: CARD_BG },
  itemUnread: { backgroundColor: UNREAD_BG },

  rowLeft: { width: 24, alignItems: 'center', marginTop: 6 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0a84ff',
  },
  unreadPlaceholder: { width: 10, height: 10, borderRadius: 5, opacity: 0 },

  rowBody: { flex: 1, paddingHorizontal: 8 },
  rowRight: { width: 68, alignItems: 'flex-end' },

  preview: { fontSize: 12, color: '#666' },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: { fontSize: 42, marginBottom: 8 },
  emptyText: { color: '#666', fontSize: 16, marginBottom: 12 },
  reloadButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reloadPressed: { opacity: 0.9 },
  reloadText: { color: '#fff', fontWeight: '600' },

  footer: { padding: 12, alignItems: 'center' },
});
