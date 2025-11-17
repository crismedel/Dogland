// AdditionalInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';

interface AdditionalInfoProps {
  user: any;
}

export default function AdditionalInfo({ user }: AdditionalInfoProps) {
  const formatDate = (dateStr: string, opts?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...opts,
    }).format(new Date(dateStr));

  const fechaNacimiento = formatDate(user.fecha_nacimiento);
  const fechaCreacion = formatDate(user.fecha_creacion);

  return (
    <View style={styles.card}>
      <AppText style={styles.sectionTitle}>Información Adicional</AppText>

      {/* Fecha de nacimiento */}
      <View style={{ marginBottom: 18 }}>
        <AppText style={styles.infoLabel}>Fecha de nacimiento</AppText>
        <View style={styles.chip}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={Colors.secondary}
          />
          <AppText style={styles.chipText}>{fechaNacimiento}</AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Miembro desde */}
      <View style={{ marginBottom: user.nombre_organizacion ? 18 : 0 }}>
        <AppText style={styles.infoLabel}>Miembro desde</AppText>
        <View style={styles.chip}>
          <Ionicons name="time-outline" size={16} color={Colors.secondary} />
          <AppText style={styles.chipText}>{fechaCreacion}</AppText>
        </View>
      </View>

      {user.nombre_organizacion ? (
        <>
          <View style={styles.divider} />

          {/* Organización */}
          <AppText style={styles.infoLabel}>Organización</AppText>
          <View style={styles.chip}>
            <Ionicons
              name="business-outline"
              size={16}
              color={Colors.secondary}
            />
            <AppText numberOfLines={2} style={styles.chipText}>
              {user.nombre_organizacion}
            </AppText>
          </View>
        </>
      ) : null}
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

  // NUEVO ESTILO TIPO CHIP
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
  },
  chipText: { color: Colors.text, fontSize: 14, flexShrink: 1 },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
});
