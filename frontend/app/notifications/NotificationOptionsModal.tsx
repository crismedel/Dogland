import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Colors } from '@/src/constants/colors';
import { NotificationItem } from '@/src/api/notifications';

type Props = {
  visible: boolean;
  onClose: () => void;
  onMarkAllRead: () => Promise<void>;
  onDeleteAll: () => void;
  onDeleteSelected: (selectedIds: number[]) => Promise<void>;
  notifications: NotificationItem[];
};

export default function NotificationOptionsModal({
  visible,
  onClose,
  onMarkAllRead,
  onDeleteAll,
  onDeleteSelected,
  notifications,
}: Props) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const selected = selectedIds.includes(item.id);

    return (
      <Pressable
        onPress={() => selectionMode && toggleSelect(item.id)}
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title ?? 'Notificación'}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLine} />
            <Text style={styles.headerTitle}>
              {selectionMode ? 'Selecciona notificaciones' : 'Opciones'}
            </Text>
          </View>

          {!selectionMode ? (
            <>
              {/* Acción: Marcar todas */}
              <TouchableOpacity style={styles.listItem} onPress={onMarkAllRead}>
                <Text style={styles.listItemText}>
                  Marcar todas como vistas
                </Text>
              </TouchableOpacity>

              {/* Acción: Eliminar todas */}
              <TouchableOpacity
                style={[styles.listItem, styles.dangerItem]}
                onPress={onDeleteAll}
              >
                <Text style={[styles.listItemText, styles.dangerText]}>
                  Eliminar todas las notificaciones
                </Text>
              </TouchableOpacity>

              {/* Activar selección */}
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setSelectionMode(true);
                  setSelectedIds([]);
                }}
              >
                <Text style={styles.listItemText}>
                  Eliminar notificaciones seleccionadas
                </Text>
              </TouchableOpacity>

              {/* Cancelar */}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                style={{ maxHeight: '68%' }}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.selectionButtons}>
                <TouchableOpacity
                  style={[
                    styles.deleteSelectedButton,
                    { opacity: selectedIds.length === 0 ? 0.4 : 1 },
                  ]}
                  disabled={selectedIds.length === 0}
                  onPress={async () => {
                    await onDeleteSelected(selectedIds);
                    setSelectionMode(false);
                    onClose();
                  }}
                >
                  <Text style={styles.deleteSelectedText}>Eliminar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelSelectionButton}
                  onPress={() => {
                    setSelectionMode(false);
                    setSelectedIds([]);
                  }}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '90%',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLine: {
    width: 45,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },

  /* LIST ITEMS */
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent + '55',
  },
  listItemText: {
    fontSize: 17,
    color: Colors.text,
  },

  /* DANGER OPTION */
  dangerItem: {
    backgroundColor: '#ffebee',
  },
  dangerText: {
    color: '#d32f2f',
    fontWeight: '600',
  },

  /* CANCEL BUTTON */
  cancelButton: {
    marginTop: 18,
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 17,
    textAlign: 'center',
    color: Colors.text,
    opacity: 0.8,
  },

  /* CARDS (SELECTION MODE) */
  card: {
    backgroundColor: Colors.backgroundSecon ?? '#fff',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardSelected: {
    backgroundColor: '#ffe6e6',
    borderColor: '#d32f2f',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },

  /* SELECTION BUTTONS */
  selectionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  deleteSelectedButton: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    borderRadius: 10,
  },
  deleteSelectedText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelSelectionButton: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    paddingVertical: 14,
    borderRadius: 10,
  },
});
