// app/adoption/perfilCan.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    <View style={styles.screen}>
      {/* 🔹 Header igual al de index.tsx */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Perfil del Animal</Text>

        {/* Espaciador invisible para centrar el título */}
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Contenido principal con scroll */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen y datos principales */}
        <Image source={{ uri: imageUrl as string }} style={styles.image} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.breed}>{breed}</Text>
        <Text style={styles.age}>{age} meses</Text>

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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dbe8d3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  backButtonHeader: { padding: 6 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 30,
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
