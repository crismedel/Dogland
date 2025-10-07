// app/adoption/perfilCan.tsx
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { authStorage } from '../../src/utils/authStorage';
import { jwtDecode } from 'jwt-decode';

const PerfilCan = () => {
  const { id, name, breed, age, imageUrl } = useLocalSearchParams();
  const router = useRouter();

  const [isWorker, setIsWorker] = useState(false);

  const checkUserRole = async () => {
      try {
        const token = await authStorage.getToken();
        if (token) {
          const decoded: any = jwtDecode(token);
          setIsWorker(decoded.role === '3');
        } else {
          setIsWorker(false);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    useEffect(() => {
      checkUserRole();
    }, []);

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

  const handleEditarPerfil = () => {
    router.push({
      pathname: '/adoption/editPerfilCan',
      params: {
        id: id,
        name: name,
        breed: breed,
        age: age,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Barra superior con botones */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditarPerfil}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Imagen y datos del animal */}
      <Image source={{ uri: imageUrl as string }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.breed}>{breed}</Text>
      <Text style={styles.age}>{age} meses</Text>

      {/* Botón de solicitar adopción */}
      {isWorker && (
        <TouchableOpacity
          style={styles.adoptionButton}
          onPress={handleSolicitarAdopcion}
        >
          <Text style={styles.adoptionButtonText}>Solicitar Adopción</Text>
          <Ionicons name="heart" size={20} color="#fff" />
        </TouchableOpacity>
      )}
      
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  editButton: {
    padding: 10,
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
