import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Quitar la importación estática
// import { Colors } from '@/src/constants/colors';
import {
  fontWeightBold,
  fontWeightSemiBold,
  AppText,
} from '@/src/components/AppText';
import CustomButton from '@/src/components/UI/CustomButton';

// 2. Importar el hook y los tipos de tema
import { useTheme } from '@/src/contexts/ThemeContext';
import { ColorsType } from '@/src/constants/colors';

interface ProfileCardProps {
  user: any;
  fullName: string;
  handle: string;
  displayAvatar: string;
  uploading: boolean;
  onEditPhoto: () => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

export default function ProfileCard({
  user,
  fullName,
  handle,
  displayAvatar,
  uploading,
  onEditPhoto,
  onEditProfile,
  onOpenSettings,
}: ProfileCardProps) {
  // 3. Llamar al hook y generar los estilos
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarWrap}>
        <Pressable
          onPress={onEditPhoto}
          disabled={uploading}
          accessibilityLabel="Editar foto de perfil"
          style={({ pressed }) => [
            {
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />

          {uploading && (
            <View style={styles.uploadingOverlay}>
              {/* 4. Usar colores del tema (texto claro) */}
              <ActivityIndicator
                size="small"
                color={isDark ? colors.text : colors.lightText}
              />
            </View>
          )}

          <View style={{ position: 'absolute', right: 6, bottom: 6 }}>
            <Pressable
              onPress={onEditPhoto}
              disabled={uploading}
              style={({ pressed }) => [
                styles.editBadge,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={14}
                // 4. Usar colores del tema (texto claro para el fondo naranja)
                color={isDark ? colors.text : colors.lightText}
              />
            </Pressable>
          </View>
        </Pressable>
      </View>

      <AppText style={styles.name}>{fullName}</AppText>
      <AppText style={styles.username}>@{handle}</AppText>

      <View
        style={[
          styles.statusBadge,
          {
            // 4. Usar colores del tema con transparencia
            backgroundColor: user.activo
              ? `${colors.success}1F` // ~12%
              : `${colors.danger}1A`, // ~10%
            marginTop: 8,
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            { color: user.activo ? colors.success : colors.danger }, // 4. Usar colores del tema
          ]}
        >
          {user.activo ? '✓ Activo' : '✗ Inactivo'}
        </AppText>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Editar perfil"
            onPress={onEditProfile}
            variant="primary"
            icon="create-outline"
            style={styles.buttonInner}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Ajustes"
            onPress={onOpenSettings}
            variant="secondary"
            icon="settings-outline"
            style={styles.buttonInner}
          />
        </View>
      </View>
    </View>
  );
}

// 5. Convertir el StyleSheet en una función
const getStyles = (colors: ColorsType, isDark: boolean) =>
  StyleSheet.create({
    profileCard: {
      backgroundColor: colors.cardBackground, // Dinámico
      borderRadius: 20,
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.secondary, // Dinámico
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.12 : 0.045, // Dinámico
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      overflow: 'visible',
    },
    avatarWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      marginTop: -6,
    },
    avatar: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderWidth: 3,
      borderColor: `${colors.primary}1F`, // Dinámico (primario con 12% alpha)
      backgroundColor: colors.cardBackground, // Dinámico
    },
    editBadge: {
      backgroundColor: colors.secondary, // Dinámico
      borderRadius: 20,
      padding: 6,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.15 : 0.08, // Dinámico
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.32)',
      borderRadius: 56,
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      color: colors.text, // Dinámico
      fontSize: 20,
      fontWeight: fontWeightBold,
      textAlign: 'center',
    },
    username: {
      color: colors.darkGray, // Dinámico
      marginTop: 4,
      textAlign: 'center',
      fontSize: 13,
    },
    statusBadge: {
      alignSelf: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginTop: 8,
      // backgroundColor es dinámico (inline)
    },
    statusText: {
      fontSize: 12,
      fontWeight: fontWeightSemiBold,
      // color es dinámico (inline)
    },
    actionsRow: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonWrapper: {
      flexBasis: '50%',
    },
    buttonInner: {
      width: 'auto',
      minWidth: 150,
      marginHorizontal: 10,
    },
  });