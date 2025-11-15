import {
  AppText,
  fontWeightBold,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AnimalCard from './component/card';
import FiltroCan from './component/filtroCan';
import Pagination from './component/Pagination';
import { mockAnimals } from './component/mockAnimals';

const { width } = Dimensions.get('window');
const SPACING = 10;
const NUM_COLUMNS = 2;
const ITEMS_PER_PAGE = 8;

const Index = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const params = useLocalSearchParams();
  const router = useRouter();
  const listRef = useRef<FlatList<any> | null>(null);

  // 🔹 Restaurar página al volver desde el perfil
  useFocusEffect(
    useCallback(() => {
      if (params.currentPage) {
        const page = parseInt(params.currentPage as string, 10);
        if (!isNaN(page)) {
          setCurrentPage(page);
        }
      }
    }, [params.currentPage]),
  );

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

    // Reset a primera página
    setCurrentPage(1);
    setTimeout(
      () => listRef.current?.scrollToOffset({ offset: 0, animated: true }),
      50,
    );
  };

  const handleClearFilters = () => {
    setFilteredAnimals(animals);
    setActiveFilters([]);
    setCurrentPage(1);
    setTimeout(
      () => listRef.current?.scrollToOffset({ offset: 0, animated: true }),
      50,
    );
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [filteredAnimals.length, totalPages]);

  useEffect(() => {
    const t = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [currentPage]);

  const getPagedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAnimals.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    const validPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(validPage);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const pagedAnimals = getPagedData();

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
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
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
          <AppText style={styles.medicalButtonText}>
            Ver historiales médicos
          </AppText>
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
          <AppText style={styles.addButtonText}>
            Agregar perrito temporal
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, width }}>
        {/* Filtros activos */}
        {activeFilters.length > 0 && (
          <View style={styles.activeFiltersContainer}>
            <AppText style={styles.activeFiltersText}>
              {activeFilters.join(' • ')}
            </AppText>
            <TouchableOpacity onPress={handleClearFilters}>
              <AppText style={styles.clearFiltersText}>Limpiar</AppText>
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

        {/* 🔹 FlatList con currentPage pasado a AnimalCard */}
        <FlatList
          ref={listRef}
          data={pagedAnimals}
          renderItem={({ item }) => (
            <AnimalCard animal={item} currentPage={currentPage} />
          )}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ gap: SPACING }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING }} />}
          showsVerticalScrollIndicator={true}
          ListFooterComponent={() =>
            filteredAnimals.length > 0 ? (
              <View style={styles.footerPagination}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </View>
            ) : null
          }
        />

        {filteredAnimals.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={50} color="#b0bec5" />
            <AppText style={styles.noResultsText}>
              No se encontraron animales
            </AppText>
            <AppText style={styles.noResultsSubtext}>
              Intenta con otros filtros
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

// 🔹 Estilos (idénticos a los que ya tenías)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors?.background ?? '#F4F6F9' },
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
    fontWeight: fontWeightBold,
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
    fontWeight: fontWeightBold,
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
  clearFiltersText: {
    fontSize: 13,
    color: '#f44336',
    fontWeight: fontWeightSemiBold,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 10, paddingTop: 6 },
  footerPagination: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: fontWeightSemiBold,
  },
  noResultsSubtext: { fontSize: 13, color: '#90a4ae', marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default Index;
