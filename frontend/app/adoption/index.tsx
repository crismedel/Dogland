// app/adoption/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AnimalCard from './component/card';
import { fetchAnimalByOrganization } from '@/src/api/animals';

import { authStorage } from '../../src/utils/authStorage';
import { jwtDecode } from 'jwt-decode';

const mockAnimals = [
  { id: '1', name: 'Mascullo', breed: 'Pastor Alemán', age: '9', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: '2', name: 'Luna', breed: 'Labrador', age: '12', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
  { id: '3', name: 'Thor', breed: 'Husky Siberiano', age: '6', imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60' },
];

const Index = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isWorker, setIsWorker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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

    if (isWorker) {
      // Si el usuario es trabajador, obtener animales por organización
      const fetchAnimalsByOrg = async () => {
        try {
          const token = await authStorage.getToken();
          if (token) {
            const decoded: any = jwtDecode(token);
            const orgId = decoded.role;
            const response = await fetchAnimalByOrganization(orgId);
            setAnimals(response);
          } else {
            setAnimals([]);
          }
        } catch (error) {
          console.error('Error fetching animals by organization:', error);
          setAnimals([]);
        }
        finally {
          setLoading(false);
        }
      };
      fetchAnimalsByOrg();
    } else {
      // Si no es trabajador, cargar animales mock
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
    }
  }, [isWorker]);

  const handleSolicitarAdopcion = () => {
    router.push('/adoption/solicitudAdopcion');
  };

  const handleVerPostulaciones = () => {
    router.push('/adoption/misPostulaciones');
  };

   const handleVerHistorialMedico = () => {
    router.push('/adoption/historialMedico');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Image
            source={require('../../assets/images/volver.png')}
            style={styles.backIconHeader}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Animales en Adopción ({animals.length})</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Animales disponibles</Text>
        <FlatList
          data={animals}
          renderItem={({ item }) => <AnimalCard animal={item} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </View>

      {/* Botones */}

      {/* Contenedor de botones en fila */}
      <View style={styles.rowButtons}>
        <TouchableOpacity style={styles.smallButton} onPress={handleVerPostulaciones}>
          <Text style={styles.solicitarButtonText}>Ver mis Postulaciones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={handleVerHistorialMedico}>
          <Text style={styles.solicitarButtonText}>Ver Historial Médico</Text>
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <Animated.View style={styles.fabMenuContainer}>
          <TouchableOpacity
            style={[styles.fabMenuItem, { marginTop: 10 }]}
            onPress={() => {
              setMenuVisible(false);
            }}
          >
            <Text style={styles.fabMenuItemText}>Publicar Adopción</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {isWorker && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <Text style={styles.fabText}>{menuVisible ? '×' : '+'}</Text>
        </TouchableOpacity>
      )}
      
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
  container: { flex: 1, backgroundColor: '#f4f6f9' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 20,
  },

  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  backButtonHeader: { padding: 6 },
  backIconHeader: { width: 24, height: 24, tintColor: '#fff' },

  content: { flex: 1, backgroundColor: '#fff', margin: 10, borderRadius: 10, padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  list: { paddingBottom: 20 },

  // 🔹 Contenedor para alinear los botones en fila
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 15,
  },

  // 🔹 Botones más pequeños
  smallButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    marginHorizontal: 5,
    paddingVertical: 10, // cambia aquí para hacerlo más grande o más chico
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  solicitarButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  solicitarButtonSubText: { color: '#fff', fontSize: 12, marginTop: 3 },

  footer: { backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  footerText: { marginBottom: 5, fontSize: 12, color: '#333' },
  socials: { flexDirection: 'row', gap: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    bottom: 150,
    right: 24,
    backgroundColor: '#4A90E2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 215,
    right: 24,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  fabMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  fabMenuItemText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
});

export default Index;
