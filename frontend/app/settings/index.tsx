// app/settings.tsx
import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useAuth } from '@/src/contexts/AuthContext';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { fontWeightSemiBold, AppText } from '@/src/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';

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
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FAF7EF',
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
    marginBottom: 16,
  },
  buttonGroup: {
    gap: 12, // Espaciado consistente entre botones
  },
  button: {
    width: '100%', // Todos los botones ocupan el 100% del ancho disponible
  },
});
