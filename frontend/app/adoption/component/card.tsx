import React from "react";
import { TouchableOpacity, Image, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface Animal {
  id: string;
  name: string;
  breed: string;
  age: string;
  imageUrl: string;
  estadoMedico?: number; // 1: sano, 2: tratamiento, 3: recuperado
  descripcionMedica?: string;
}

interface Props {
  animal: Animal;
}

const AnimalCard: React.FC<Props> = ({ animal }) => {
  const router = useRouter();


  const handlePress = () => {
  router.push({
    pathname: "/adoption/perfilCan",
    params: {
      id: animal.id,
      name: animal.name,
      breed: animal.breed,
      age: animal.age,
      imageUrl: animal.imageUrl,
      estadoMedico: animal.estadoMedico, // 👈 agregar este campo
      descripcionMedica: animal.descripcionMedica, // 👈 y este también
    },
  });
};



  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={{ uri: animal.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{animal.name}</Text>
        <Text style={styles.breed}>{animal.breed}</Text>
        <Text style={styles.age}>{animal.age} meses</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8,
    overflow: "hidden",
    elevation: 4, // sombra Android
    shadowColor: "#000", // sombra iOS
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 120,
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  breed: {
    fontSize: 14,
    color: "#666",
  },
  age: {
    fontSize: 12,
    color: "#999",
  },
});

export default AnimalCard;
