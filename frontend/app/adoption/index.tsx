import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

import {
  AppText,
  fontWeightBold,
  fontWeightSemiBold,
} from '@/src/components/AppText';
import CustomHeader from '@/src/components/UI/CustomHeader';
import { Colors } from '@/src/constants/colors';
import AnimalCard from './component/card';
import FiltroCan from './component/filtroCan';
import Pagination from './component/Pagination';
import useAnimals from '@/src/hooks/useAnimals';
import { ListRenderItem } from 'react-native';
import { Animal } from '@/src/types/animals';
import { useNotification } from '@/src/components/notifications/NotificationProvider';
import {
  HEALTH_MAPPING,
  SIZES_MAPPING,
  BREED_MAPPING,
} from '@/src/utils/animalUtils';

const { width } = Dimensions.get('window');
const SPACING = 10;
const NUM_COLUMNS = 2;
const ITEMS_PER_PAGE = 8;

interface AppliedFilters {
  ageRange: number[];
  selectedBreeds: string[];
  selectedHealth: string[];
  selectedSizes: string[];
  showFavorites?: boolean;
}

const AdoptionIndex = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(
    null,
  );

  const {
    allAnimals: animals,
    getFiltered,
    favoritesSet,
    toggleFavorite,
    isLoading,
    isFetching,
    refetch,
  } = useAnimals();

  const params = useLocalSearchParams();
  const router = useRouter();
  const { showError } = useNotification();

  useFocusEffect(
    useCallback(() => {
      if (params.currentPage) {
        const page = parseInt(params.currentPage as string, 10);
        if (!isNaN(page)) setCurrentPage(page);
      }
    }, [params.currentPage]),
  );

  const filteredAnimals = useMemo(() => {
    if (!appliedFilters) return animals;

    const filters = {
      onlyFavorites: appliedFilters.showFavorites,
      id_raza:
        appliedFilters.selectedBreeds.length > 0
          ? Number(
              Object.keys(BREED_MAPPING).find(
                (key) =>
                  BREED_MAPPING[Number(key)] ===
                  appliedFilters.selectedBreeds[0],
              ),
            )
          : null,
      id_estado_salud:
        appliedFilters.selectedHealth.length > 0
          ? Number(
              Object.keys(HEALTH_MAPPING).find(
                (key) =>
                  HEALTH_MAPPING[Number(key)] ===
                  appliedFilters.selectedHealth[0],
              ),
            )
          : null,
      tamanio:
        appliedFilters.selectedSizes.length > 0
          ? appliedFilters.selectedSizes[0]
          : null,
    };

    return getFiltered(filters as any);
  }, [animals, appliedFilters, getFiltered, BREED_MAPPING, HEALTH_MAPPING]);

  const handleApplyFilters = useCallback((filters: AppliedFilters) => {
    setAppliedFilters(filters);

    const newActiveFilters: string[] = [];

    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 10) {
      newActiveFilters.push(
        `Edad: ${filters.ageRange[0]}-${filters.ageRange[1]} meses`,
      );
    }

    if (filters.selectedBreeds.length > 0) {
      newActiveFilters.push(`Raza: ${filters.selectedBreeds.join(', ')}`);
    }

    if (filters.selectedHealth.length > 0) {
      newActiveFilters.push(`Salud: ${filters.selectedHealth.join(', ')}`);
    }

    if (filters.selectedSizes.length > 0) {
      newActiveFilters.push(`Tamaño: ${filters.selectedSizes.join(', ')}`);
    }

    if (filters.showFavorites) {
      newActiveFilters.push('Solo favoritos');
    }

    setActiveFilters(newActiveFilters);
    setShowFilters(false);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setAppliedFilters(null);
    setActiveFilters([]);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE),
  );

  const pagedAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnimals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAnimals, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(validPage);
    },
    [totalPages],
  );

  const handleToggleFavorite = useCallback(
    async (animalId: string) => {
      try {
        await toggleFavorite(animalId);
      } catch {
        showError('Error', 'No se pudo actualizar favorito');
      }
    },
    [toggleFavorite, showError],
  );

  const isAnimalFavorited = useCallback(
    (animalId: string) => {
      return favoritesSet.has(animalId);
    },
    [favoritesSet],
  );

  const renderAnimalCard: ListRenderItem<Animal> = useCallback(
    ({ item }) => (
      <AnimalCard
        animal={item}
        currentPage={currentPage}
        isFavorited={isAnimalFavorited(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
      />
    ),
    [currentPage, isAnimalFavorited, handleToggleFavorite],
  );

  const keyExtractor = useCallback((item: Animal) => String(item.id), []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <AppText style={{ marginTop: 10 }}>Cargando animales...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

        <FiltroCan
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          animals={animals}
          breedsMapping={BREED_MAPPING}
          healthMapping={HEALTH_MAPPING}
          sizesMapping={SIZES_MAPPING}
        />

        <FlatList
          data={pagedAnimals}
          renderItem={renderAnimalCard}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ gap: SPACING }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING }} />}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
              progressViewOffset={10}
            />
          }
          ListFooterComponent={
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
          ListEmptyComponent={
            !isLoading && appliedFilters ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={50} color="#b0bec5" />
                <AppText style={styles.noResultsText}>
                  No se encontraron animales
                </AppText>
                <AppText style={styles.noResultsSubtext}>
                  Intenta con otros filtros
                </AppText>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          windowSize={11}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background ?? '#F4F6F9' },
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 6,
    flexGrow: 1,
  },
  footerPagination: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 6,
  },
  noResultsText: {
    fontSize: 16,
    color: '#607d8b',
    marginTop: 10,
    fontWeight: fontWeightSemiBold,
  },
  noResultsSubtext: { fontSize: 13, color: '#90a4ae', marginTop: 2 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

export default AdoptionIndex;
