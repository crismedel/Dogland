// Componente que muestra el get de todos los usuarios
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { User } from "../../types/user";

export default function UserCard({ user }: { user: User }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.nombre_usuario} {user.apellido_paterno}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Teléfono: {user.telefono}</Text>
      <Text>Rol: {user.nombre_rol}</Text>
      <Text>Ciudad: {user.nombre_ciudad}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    margin: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
