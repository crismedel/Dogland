// ContactInfo.tsx
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';

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

      <View style={{ marginBottom: 16 }}>
        <AppText style={styles.infoLabel}>Email</AppText>
        <View style={styles.infoValueWrap}>
          <AppText numberOfLines={2} style={styles.infoValue}>
            {user.email}
          </AppText>
          <Pressable
            onPress={() => showInfo('Copiado', user.email)}
            accessibilityLabel="Copiar Email"
            style={({ pressed }) => [
              styles.copyPill,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <AppText style={styles.copyPillText}>Copiar</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ marginBottom: 16 }}>
        <AppText style={styles.infoLabel}>Teléfono</AppText>
        <View style={styles.infoValueWrap}>
          <AppText numberOfLines={1} style={styles.infoValue}>
            {formatPhone(user.telefono)}
          </AppText>
          <Pressable
            onPress={() => showInfo('Copiado', String(user.telefono))}
            accessibilityLabel="Copiar Teléfono"
            style={({ pressed }) => [
              styles.copyPill,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <AppText style={styles.copyPillText}>Copiar</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View>
        <AppText style={styles.infoLabel}>Ciudad</AppText>
        <View style={styles.infoValueWrap}>
          <AppText numberOfLines={1} style={styles.infoValue}>
            {user.nombre_ciudad}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,216,167,0.28)',
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
  infoValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { color: Colors.text, fontSize: 14, flexShrink: 1 },
  copyPill: {
    backgroundColor: Colors.lightText,
    borderWidth: 1,
    borderColor: 'rgba(242,216,167,0.28)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  copyPillText: { color: Colors.text, fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 10,
  },
});
