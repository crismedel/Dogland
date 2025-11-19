// app/settings.tsx
import { fetchUserProfile, toggle2FA } from '@/src/api/users';
import {
  AppText,
  fontWeightMedium,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications';
import CustomButton from '@/src/components/UI/CustomButton';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { ColorsType } from '@/src/constants/colors';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { confirm, showSuccess, showError } = useNotification();
  const { logout } = useAuth();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [has2FA, setHas2FA] = useState(false);
  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // Cargar el perfil del usuario al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsFetchingProfile(true);
      const profile = await fetchUserProfile();
      setHas2FA(profile.has_2fa || false);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      showError('Error', 'No se pudo cargar la configuración del usuario.');
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleToggle2FA = async (value: boolean) => {
    try {
      setIsLoading2FA(true);
      const response = await toggle2FA(value);

      if (response.success) {
        setHas2FA(value);
        showSuccess(
          'Configuración actualizada',
          value
            ? 'Autenticación de dos factores activada. Recibirás un código por email al iniciar sesión.'
            : 'Autenticación de dos factores desactivada.',
        );
      }
    } catch (error: any) {
      console.error('Error al cambiar 2FA:', error);
      showError(
        'Error',
        error.response?.data?.message ||
          'No se pudo actualizar la configuración.',
      );
      // Revertir el switch en caso de error
      setHas2FA(!value);
    } finally {
      setIsLoading2FA(false);
    }
  };

  const handleLogout = () => {
    confirm({
      title: 'Confirmar',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          await logout();
          showSuccess('Sesión cerrada', 'Has cerrado sesión correctamente.');
          setTimeout(() => router.replace('/auth'), 500);
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Configuración"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.lightText} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Seguridad */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Seguridad</AppText>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <AppText style={styles.settingLabel}>
                Autenticación de dos factores
              </AppText>
              <AppText style={styles.settingDescription}>
                Recibe un código por email al iniciar sesión
              </AppText>
            </View>
            {isFetchingProfile ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <Switch
                value={has2FA}
                onValueChange={handleToggle2FA}
                disabled={isLoading2FA}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={has2FA ? colors.secondary : colors.gray}
                ios_backgroundColor={colors.gray}
              />
            )}
          </View>
        </View>

        {/* Cuenta */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Cuenta</AppText>
          <View style={styles.buttonGroup}>
            <CustomButton
              title="Cambiar contraseña"
              onPress={() => router.push('/settings/change-password')}
              icon="key-outline"
              style={styles.button}
            />
            <CustomButton
              title="Cerrar sesión"
              onPress={handleLogout}
              variant="secondary"
              icon="log-out-outline"
              style={styles.button}
            />
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Preferencias</AppText>
          <View style={styles.buttonGroup}>
            <CustomButton
              title="Tema"
              onPress={() => router.push('/settings/theme')}
              icon="moon-outline"
              style={styles.button}
            />
            <CustomButton
              title="Notificaciones"
              onPress={() => router.push('/settings/notifications')}
              icon="notifications-outline"
              style={styles.button}
            />
          </View>
        </View>

        {/* Privacidad */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Privacidad</AppText>
          <View style={styles.buttonGroup}>
            <CustomButton
              title="Permisos del dispositivo"
              onPress={() => router.push('/settings/permissions')}
              icon="shield-checkmark-outline"
              style={styles.button}
            />
          </View>
        </View>

        {/* Soporte y legal */}
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>Soporte</AppText>
          <View style={styles.buttonGroup}>
            <CustomButton
              title="Centro de ayuda"
              onPress={() => router.push('/settings/help')}
              icon="help-circle-outline"
              style={styles.button}
            />
            <CustomButton
              title="Enviar feedback"
              onPress={() => router.push('/settings/feedback')}
              icon="chatbubbles-outline"
              style={styles.button}
            />
            <CustomButton
              title="Términos y privacidad"
              onPress={() => router.push('/settings/legal')}
              icon="document-text-outline"
              style={styles.button}
            />
            <CustomButton
              title="Acerca de"
              onPress={() => router.push('/settings/about')}
              icon="information-circle-outline"
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: ColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    sectionTitle: {
      color: colors.secondary,
      fontSize: 18,
      fontWeight: fontWeightSemiBold,
      marginBottom: 16,
    },
    buttonGroup: {
      gap: 12, // Espaciado consistente entre botones
    },
    button: {
      width: '100%', // Todos los botones ocupan el 100% del ancho disponible
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: fontWeightMedium,
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.darkGray,
      lineHeight: 18,
    },
  });
