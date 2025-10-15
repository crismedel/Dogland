// Pantalla que muestra el componente UserCard para listar usuarios
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { fetchUsers } from "../src/api/users";
import { User } from "../src/types/user";
import UserCard from "../src/components/users/UserCard";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(err => console.error("Error cargando usuarios:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="blue" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id_usuario.toString()}
        renderItem={({ item }) => <UserCard user={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
