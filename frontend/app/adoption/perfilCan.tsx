import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const PerfilCan = () => {
  const { id, name, breed, age, imageUrl } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl as string }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.breed}>{breed}</Text>
      <Text style={styles.age}>{age} meses</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  breed: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  age: {
    fontSize: 16,
    color: "#999",
  },
});

export default PerfilCan;
