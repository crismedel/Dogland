// Componente que muestra el get de todos los usuarios
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User } from '../../types/user';
import {
  fontWeightBold,
  fontWeightSemiBold,
  fontWeightMedium,
  AppText,
} from '@/src/components/AppText';

export default function UserCard({ user }: { user: User }) {
  return (
    <View style={styles.card}>
      <AppText style={styles.name}>
        {user.nombre_usuario} {user.apellido_paterno}
      </AppText>
      <AppText>Email: {user.email}</AppText>
      <AppText>Teléfono: {user.telefono}</AppText>
      <AppText>Rol: {user.nombre_rol}</AppText>
      <AppText>Ciudad: {user.nombre_ciudad}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  name: {
    fontSize: 16,
    fontWeight: fontWeightBold,
  },
});
