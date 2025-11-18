import React from 'react';
import { View, StyleSheet } from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface AdditionalInfoProps {
  user: any;
}

export default function AdditionalInfo({ user }: AdditionalInfoProps) {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
            color={colors.secondary} // 4. Usar colores del tema
          />
          <AppText style={styles.chipText}>{fechaNacimiento}</AppText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Miembro desde */}
      <View style={{ marginBottom: user.nombre_organizacion ? 18 : 0 }}>
        <AppText style={styles.infoLabel}>Miembro desde</AppText>
        <View style={styles.chip}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.secondary} // 4. Usar colores del tema
          />
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
              color={colors.secondary} // 4. Usar colores del tema
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

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.1 : 0.045, // Dinámico
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },

    sectionTitle: {
      color: colors.secondary, // Dinámico
      fontSize: 16,
      fontWeight: fontWeightMedium,
      marginBottom: 12,
    },
    infoLabel: {
      color: colors.darkGray, // Dinámico
      fontWeight: fontWeightMedium,
      fontSize: 12,
      marginBottom: 6,
    },

    // NUEVO ESTILO TIPO CHIP
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.backgroundSecon, // Dinámico
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    chipText: { color: colors.text, fontSize: 14, flexShrink: 1 }, // Dinámico

    divider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', // Dinámico
      marginVertical: 12,
    },
  });