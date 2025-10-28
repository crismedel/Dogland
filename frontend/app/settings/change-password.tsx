// app/settings/change-password.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import CustomHeader from '@/src/components/UI/CustomHeader';
import CustomButton from '@/src/components/UI/CustomButton';
import { AppText } from '@/src/components/AppText';
import { useNotification } from '@/src/components/notifications/NotificationContext';
import { useAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const { showSuccess, showError, confirm } = useNotification();
  const { changePassword } = useAuth() as any;

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showError('Campos incompletos', 'Completa todos los campos.');
      return;
    }
    if (newPass !== confirmPass) {
      showError('Contraseñas no coinciden', 'Verifica la confirmación.');
      return;
    }
    if (currentPass === newPass) {
      showError(
        'Contraseña inválida',
        'La nueva contraseña debe ser distinta a la actual.',
      );
      return;
    }
    if (newPass.length < 6) {
      showError(
        'Contraseña débil',
        'La nueva contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    confirm({
      title: 'Confirmar',
      message: '¿Deseas actualizar tu contraseña?',
      confirmLabel: 'Actualizar',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        try {
          setLoading(true);
          await changePassword(currentPass, newPass);
          showSuccess('Actualizada', 'Tu contraseña fue actualizada.');
          router.back();
        } catch (e: any) {
          console.log('Change password error:', e);
          showError('Error', e?.message || 'No se pudo cambiar la contraseña.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Cambiar contraseña"
        leftComponent={
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <View style={styles.card}>
        <AppText style={styles.label}>Contraseña actual</AppText>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={currentPass}
          onChangeText={setCurrentPass}
          placeholder="••••••••"
          placeholderTextColor="#9C815F"
          autoCapitalize="none"
        />
        <AppText style={styles.label}>Nueva contraseña</AppText>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={newPass}
          onChangeText={setNewPass}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor="#9C815F"
          autoCapitalize="none"
        />
        <AppText style={styles.label}>Confirmar contraseña</AppText>
        <TextInput
          secureTextEntry
          style={styles.input}
          value={confirmPass}
          onChangeText={setConfirmPass}
          placeholder="Repite la contraseña"
          placeholderTextColor="#9C815F"
          autoCapitalize="none"
        />
        <CustomButton
          title="Guardar"
          onPress={handleSave}
          loading={loading}
          icon="save-outline"
          style={{ marginTop: 12 }}
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
  label: { marginTop: 8, color: '#7A5C3A' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F2D8A7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: '#7A5C3A',
  },
});
