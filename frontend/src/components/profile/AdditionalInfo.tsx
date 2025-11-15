// AdditionalInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';

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

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const edad = calcularEdad(user.fecha_nacimiento);
  const fechaCreacion = formatDate(user.fecha_creacion);

  return (
    <View style={styles.card}>
      <AppText style={styles.sectionTitle}>Información Adicional</AppText>

      <View style={{ marginBottom: 16 }}>
        <AppText style={styles.infoLabel}>Fecha de nacimiento</AppText>
        <View style={styles.infoValueWrap}>
          <AppText style={styles.infoValue}>
            {formatDate(user.fecha_nacimiento)}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ marginBottom: user.nombre_organizacion ? 16 : 0 }}>
        <AppText style={styles.infoLabel}>Miembro desde</AppText>
        <View style={styles.infoValueWrap}>
          <AppText style={styles.infoValue}>{fechaCreacion}</AppText>
        </View>
      </View>

      {user.nombre_organizacion ? (
        <>
          <View style={styles.divider} />
          <View>
            <AppText style={styles.infoLabel}>Organización</AppText>
            <View style={styles.infoValueWrap}>
              <AppText numberOfLines={2} style={styles.infoValue}>
                {user.nombre_organizacion}
              </AppText>
            </View>
          </View>
        </>
      ) : null}
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 10,
  },
});
