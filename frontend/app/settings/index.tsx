// app/settings.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';

export default function SettingsScreen() {
  // Si manejas el token en contexto/secure storage, reemplaza este estado local
  const [token, setToken] = useState('mi_token');
  const { confirm, showSuccess } = useNotification();

  const handleLogout = () => {
    confirm({
      title: 'Confirmar',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
      cancelLabel: 'Cancelar',
      destructive: true,
      onConfirm: () => {
        setToken('');
        showSuccess('Sesión cerrada', 'Has cerrado sesión correctamente.');
        // Pequeño delay para que el usuario vea el toast antes de navegar
        setTimeout(() => {
          router.replace('/auth');
        }, 500);
      },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Configuración" />
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
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
    fontWeight: '700',
    marginBottom: 12,
  },
});
