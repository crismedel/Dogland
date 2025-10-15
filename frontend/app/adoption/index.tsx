import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AnimalCard from './component/card';
import FiltroCan from './component/filtroCan';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';

const { width } = Dimensions.get('window');
const SPACING = 10;
const NUM_COLUMNS = 2;

const mockAnimals = [
  {
    id: '1',
    name: 'Mascullo',
    breed: 'Pastor Alemán',
    age: 18,
    size: 'Grande',
    species: 'Perro',
    health: 'Sano',
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=60',
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Labrador',
    age: 14,
    size: 'Mediano',
    species: 'Perro',
    health: 'En tratamiento',
    imageUrl:
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=60',
  },
  {
    id: '3',
    name: 'Thor',
    breed: 'Husky Siberiano',
    age: 72,
    size: 'Grande',
    species: 'Perro',
    health: 'Sano',
    imageUrl:
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=900&q=60',
  },
  {
    id: '4',
    name: 'Mishi',
    breed: 'Siames',
    age: 24,
    size: 'Pequeño',
    species: 'Gato',
    health: 'Sano',
    imageUrl:
      'https://images.unsplash.com/photo-1601758125946-6ec2ef642b1a?auto=format&fit=crop&w=900&q=60',
  },
  {
    id: '5',
    name: 'Rex',
    breed: 'Bulldog',
    age: 36,
    size: 'Mediano',
    species: 'Perro',
    health: 'Discapacitado',
    imageUrl:
      'https://images.unsplash.com/photo-1517423447168-cb804aafa6e0?auto=format&fit=crop&w=900&q=60',
  },
  {
    id: '6',
    name: 'Bella',
    breed: 'Poodle',
    age: 12,
    size: 'Pequeño',
    species: 'Perro',
    health: 'Sano',
    imageUrl:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=60',
  },
];

const Index = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        // por ahora solo usamos los datos de ejemplo
        setAnimals(mockAnimals);
        setFilteredAnimals(mockAnimals);
      } catch (error) {
        console.error('Error fetching animals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  const handleApplyFilters = (filters: {
    ageRange: number[];
    selectedBreeds: string[];
    selectedHealth: string[];
    selectedSizes: string[];
  }) => {
    const filtered = animals.filter((animal) => {
      const ageMatch =
        animal.age >= filters.ageRange[0] && animal.age <= filters.ageRange[1];
      const breedMatch =
        filters.selectedBreeds.length === 0 ||
        filters.selectedBreeds.includes(animal.breed);
      const healthMatch =
        filters.selectedHealth.length === 0 ||
        filters.selectedHealth.includes(animal.health);
      const sizeMatch =
        filters.selectedSizes.length === 0 ||
        filters.selectedSizes.includes(animal.size);
      return ageMatch && breedMatch && healthMatch && sizeMatch;
    });

    setFilteredAnimals(filtered);
    setShowFilters(false);

    const active: string[] = [];
    if (filters.selectedBreeds.length > 0)
      active.push(`${filters.selectedBreeds.length} razas`);
    if (filters.selectedHealth.length > 0)
      active.push(`${filters.selectedHealth.length} estados`);
    if (filters.selectedSizes.length > 0)
      active.push(`${filters.selectedSizes.length} tamaños`);
    if (
      filters.ageRange[0] > 0 ||
      filters.ageRange[1] < Math.max(...animals.map((a) => a.age))
    ) {
      active.push('edad');
    }
    setActiveFilters(active);
  };

  const handleClearFilters = () => {
    setFilteredAnimals(animals);
    setActiveFilters([]);
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
      <CustomHeader
        title={`Animales en Adopción (${filteredAnimals.length})`}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require('../../assets/images/volver.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
            />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* 🔹 Botón para ver historiales médicos */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={styles.medicalButton}
          onPress={() => router.push('/adoption/historialMedico')}
        >
          <Ionicons
            name="medkit-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.medicalButtonText}>Ver historiales médicos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/adoption/agregarPerrito')}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>Agregar perrito temporal</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, width }}>
        {/* Filtros activos */}
        {activeFilters.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersText}>
              {activeFilters.join(' • ')}
            </Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.clearFiltersText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Componente de Filtros */}
        <FiltroCan
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          animals={animals}
        />

        {/* Lista de animales */}
        <FlatList
          data={filteredAnimals}
          renderItem={({ item }) => <AnimalCard animal={item} />}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ gap: SPACING }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING }} />}
          showsVerticalScrollIndicator={true}
        />

        {filteredAnimals.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={50} color="#b0bec5" />
            <Text style={styles.noResultsText}>No se encontraron animales</Text>
            <Text style={styles.noResultsSubtext}>
              Intenta con otros filtros
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.background ?? '#F4F6F9',
  },
  // 🔹 Estilo del botón de historial médico
  medicalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  medicalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // 🔹 Estilo del nuevo botón temporal
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#EAF3FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#1976d2',
    flex: 1,
    marginRight: 12,
  },
  clearFiltersText: { fontSize: 13, color: '#f44336', fontWeight: '700' },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 6,
  },
  noResults: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  noResultsText: {
    fontSize: 16,
    color: '#607d8b',
    marginTop: 10,
    fontWeight: '700',
  },
  noResultsSubtext: { fontSize: 13, color: '#90a4ae', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default Index;
