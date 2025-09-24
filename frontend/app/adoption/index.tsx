// app/adoption/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AnimalCard from './component/card';

// Datos de ejemplo
const mockAnimals = [
  {
    id: '1',
    name: 'Mascullo',
    breed: 'Pastor Alemán',
    age: '9',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Labrador',
    age: '12',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'Thor',
    breed: 'Husky Siberiano',
    age: '6',
    imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
  },
];

const Index = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setAnimals(mockAnimals);
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const handleSolicitarAdopcion = () => {
    router.push('/adoption/solicitudAdopcion');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Botón de solicitar adopción */}
      <TouchableOpacity style={styles.solicitarButton} onPress={handleSolicitarAdopcion}>
        <Text style={styles.solicitarButtonText}>¿Te gustaría adoptar un perrito?</Text>
        <Text style={styles.solicitarButtonSubText}>Quiero adoptar!</Text>
      </TouchableOpacity>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Animales disponibles para adopción</Text>
        <FlatList
          data={animals}
          renderItem={({ item }) => <AnimalCard animal={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Puedes buscarnos en :</Text>
        <View style={styles.socials}>
          <Ionicons name="logo-twitter" size={24} color="black" />
          <Ionicons name="logo-facebook" size={24} color="black" />
          <Ionicons name="logo-instagram" size={24} color="black" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#dbe8d3', // verde claro como en la captura
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'space-between',
  },
  solicitarButton: {
    backgroundColor: '#4A90E2',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  solicitarButtonSubText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  footerText: {
    marginBottom: 5,
    fontSize: 12,
    color: '#333',
  },
  socials: {
    flexDirection: 'row',
    gap: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Index;