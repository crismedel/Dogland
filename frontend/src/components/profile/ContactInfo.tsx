import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import { fontWeightMedium, AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface ContactInfoProps {
  user: any;
  showInfo: (title: string, message: string) => void;
}

export default function ContactInfo({ user, showInfo }: ContactInfoProps) {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
            {/* 4. Usar colores del tema */}
            <Ionicons name="mail-outline" size={16} color={colors.secondary} />
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
            {/* 4. Usar colores del tema */}
            <Ionicons name="copy-outline" size={14} color={colors.secondary} />
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
            {/* 4. Usar colores del tema */}
            <Ionicons name="call-outline" size={16} color={colors.secondary} />
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
            {/* 4. Usar colores del tema */}
            <Ionicons name="copy-outline" size={14} color={colors.secondary} />
            <AppText style={styles.copyPillText}>Copiar</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* CIUDAD */}
      <AppText style={styles.infoLabel}>Ciudad</AppText>
      <View style={styles.chip}>
        {/* 4. Usar colores del tema */}
        <Ionicons
          name="location-outline"
          size={16}
          color={colors.secondary}
        />
        <AppText numberOfLines={1} style={styles.chipText}>
          {user.nombre_ciudad}
        </AppText>
      </View>
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
      backgroundColor: colors.background, // Dinámico
      borderWidth: 1,
      borderColor: colors.backgroundSecon, // Dinámico
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      flexShrink: 1,
    },
    chipText: {
      color: colors.text, // Dinámico
      fontSize: 14,
      flexShrink: 1,
    },

    // Pill copiar
    copyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.cardBackground, // Dinámico
      borderWidth: 1,
      borderColor: `${colors.secondary}47`, // Dinámico (secondary con 28% alpha)
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
    },
    copyPillText: {
      color: colors.text, // Dinámico
      fontSize: 12,
    },

    divider: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', // Dinámico
      marginVertical: 12,
    },
  });