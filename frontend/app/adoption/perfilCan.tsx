// app/adoption/perfilCan.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const PerfilCan = () => {
  const { id, name, breed, age, imageUrl } = useLocalSearchParams();
  const router = useRouter();

  const handleSolicitarAdopcion = () => {
    router.push({
      pathname: '/adoption/solicitudAdopcion',
      params: {
        idAnimal: id,
        nombreAnimal: name,
        breed: breed,
        age: age,
        imageUrl: imageUrl,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      ></TouchableOpacity>

      <Image source={{ uri: imageUrl as string }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.breed}>{breed}</Text>
      <Text style={styles.age}>{age} </Text>

      {/* Botón de solicitar adopción */}
      <TouchableOpacity
        style={styles.adoptionButton}  
        onPress={handleSolicitarAdopcion}
      >
        <Text style={styles.adoptionButtonText}>Solicitar Adopción</Text>
        <Ionicons name="heart" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Información adicional del animal */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Información del Animal</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Edad:</Text>
          <Text style={styles.infoValue}>{age} meses</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Raza:</Text>
          <Text style={styles.infoValue}>{breed}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={styles.infoValue}>Disponible para adopción</Text>
        </View>
      </View>

      {/* Requisitos de adopción */}
      <View style={styles.requirementsSection}>
        <Text style={styles.sectionTitle}>Requisitos de Adopción</Text>
        <Text style={styles.requirementText}>
          • Compromiso de cuidado responsable
        </Text>
        <Text style={styles.requirementText}>• Vivienda adecuada</Text>
        <Text style={styles.requirementText}>• Tiempo para dedicarle</Text>
        <Text style={styles.requirementText}>
          • Compromiso de esterilización
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#dbe8d3',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  breed: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  age: {
    fontSize: 18,
    color: '#999',
    marginBottom: 30,
  },
  adoptionButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adoptionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requirementsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4A90E2',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default PerfilCan;
