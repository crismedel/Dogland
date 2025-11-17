// ContactInfo.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';

interface ContactInfoProps {
  user: any;
  showInfo: (title: string, message: string) => void;
}

export default function ContactInfo({ user, showInfo }: ContactInfoProps) {
  const formatPhone = (value?: string | number) => {
    if (!value) return '-';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length >= 11) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(
        3,
        7,
      )} ${digits.slice(7, 11)}`;
    }
    return digits.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3');
  };

  return (
    <View style={styles.card}>
      <AppText style={styles.sectionTitle}>Información de Contacto</AppText>

      {/* EMAIL */}
      <View style={{ marginBottom: 18 }}>
        <AppText style={styles.infoLabel}>Email</AppText>

        <View style={styles.row}>
          <View style={styles.chip}>
            <Ionicons name="mail-outline" size={16} color={Colors.secondary} />
            <AppText numberOfLines={2} style={styles.chipText}>
              {user.email}
            </AppText>
          </View>

          <Pressable
            onPress={() => showInfo('Copiado', user.email)}
            style={({ pressed }) => [
              styles.copyPill,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Ionicons name="copy-outline" size={14} color={Colors.secondary} />
            <AppText style={styles.copyPillText}>Copiar</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* PHONE */}
      <View style={{ marginBottom: 18 }}>
        <AppText style={styles.infoLabel}>Teléfono</AppText>

        <View style={styles.row}>
          <View style={styles.chip}>
            <Ionicons name="call-outline" size={16} color={Colors.secondary} />
            <AppText numberOfLines={1} style={styles.chipText}>
              {formatPhone(user.telefono)}
            </AppText>
          </View>

          <Pressable
            onPress={() => showInfo('Copiado', String(user.telefono))}
            style={({ pressed }) => [
              styles.copyPill,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Ionicons name="copy-outline" size={14} color={Colors.secondary} />
            <AppText style={styles.copyPillText}>Copiar</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* CIUDAD */}
      <AppText style={styles.infoLabel}>Ciudad</AppText>
      <View style={styles.chip}>
        <Ionicons name="location-outline" size={16} color={Colors.secondary} />
        <AppText numberOfLines={1} style={styles.chipText}>
          {user.nombre_ciudad}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    shadowColor: '#000',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  sectionTitle: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: fontWeightMedium,
    marginBottom: 12,
  },
  infoLabel: {
    color: Colors.darkGray,
    fontWeight: fontWeightMedium,
    fontSize: 12,
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // CHIP NUEVO
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.backgroundSecon,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexShrink: 1,
  },
  chipText: { color: Colors.text, fontSize: 14, flexShrink: 1 },

  // Pill copiar
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightText,
    borderWidth: 1,
    borderColor: 'rgba(242,216,167,0.28)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  copyPillText: { color: Colors.text, fontSize: 12 },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
});
