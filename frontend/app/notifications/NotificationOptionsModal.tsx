import React, { useState } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { NotificationItem } from '@/src/api/notifications';
import { AppText } from '@/src/components/AppText'; // Importar AppText si es necesario
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

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
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },

    sheet: {
      backgroundColor: colors.cardBackground, // Dinámico
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
      backgroundColor: colors.gray, // Dinámico
      borderRadius: 4,
      marginBottom: 12,
      opacity: 0.5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text, // Dinámico
    },

    /* LIST ITEMS */
    listItem: {
      paddingVertical: 16,
      paddingHorizontal: 6,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.accent}55`, // Dinámico
    },
    listItemText: {
      fontSize: 17,
      color: colors.text, // Dinámico
    },

    /* DANGER OPTION */
    dangerItem: {
      backgroundColor: `${colors.danger}15`, // Dinámico
    },
    dangerText: {
      color: colors.danger, // Dinámico
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
      color: colors.text, // Dinámico
      opacity: 0.8,
    },

    /* CARDS (SELECTION MODE) */
    card: {
      backgroundColor: colors.backgroundSecon, // Dinámico
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.gray, // Dinámico
      elevation: 1.5,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    cardSelected: {
      backgroundColor: `${colors.danger}20`, // Dinámico
      borderColor: colors.danger, // Dinámico
    },
    cardPressed: {
      opacity: 0.7,
    },
    cardTitle: {
      fontSize: 16,
      color: colors.text, // Dinámico
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
      backgroundColor: colors.danger, // Dinámico
      paddingVertical: 14,
      borderRadius: 10,
    },
    deleteSelectedText: {
      color: colors.lightText, // Dinámico
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
    },

    cancelSelectionButton: {
      flex: 1,
      backgroundColor: colors.backgroundSecon, // Dinámico
      paddingVertical: 14,
      borderRadius: 10,
    },
  });