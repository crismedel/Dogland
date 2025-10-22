// app/settings.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useAuth } from '@/src/contexts/AuthContext';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

export default function SettingsScreen() {
  const { confirm, showSuccess } = useNotification();
  const { logout } = useAuth();

  const handleLogout = () => {
    confirm({
      title: 'Confirmar',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: async () => {
        try {
          // Usar el logout del AuthContext para limpiar todo
          await logout();

          showSuccess('Sesión cerrada', 'Has cerrado sesión correctamente.');

          // Pequeño delay para que el usuario vea el toast antes de navegar
          setTimeout(() => {
            router.replace('/auth');
          }, 500);
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Configuración" />
      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>Cuenta</AppText>
        <CustomButton
          title="Cerrar sesión"
          onPress={handleLogout}
          variant="secondary"
          icon="log-out-outline"
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7EF',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F2D8A7',
  },
  sectionTitle: {
    color: '#CC5803',
    fontSize: 18,
    fontWeight: fontWeightSemiBold,
    marginBottom: 12,
  },
});
