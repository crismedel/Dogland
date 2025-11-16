import { useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { normalizeAnimal } from '@/src/utils/animalUtils';
import { Animal } from '@/src/types/animals';
import { fetchAnimals } from '@/src/api/animals';
import { useNotification } from '@/src/components/notifications/NotificationProvider';

const FAVORITES_KEY = 'favorites_v1';

async function fetchAnimalsFromApi(): Promise<Animal[]> {
  try {
    const data = await fetchAnimals();
    return data.map(normalizeAnimal);
  } catch (e) {
    console.warn('fetchAnimalsFromApi error', e);
    return [];
  }
}

export default function useAnimals() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const {
    data: animalsRaw = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<Animal[]>({
    queryKey: ['animals'],
    queryFn: fetchAnimalsFromApi,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });

  const { data: favoritesArray = [] } = useQuery<string[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const json = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!json) return [];
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch (e) {
        console.warn('Failed to read favorites from storage', e);
        return [];
      }
    },
    staleTime: Infinity,
  });

  const favoritesSet = useMemo(() => new Set(favoritesArray), [favoritesArray]);

  const persistFavorites = useCallback(async (arr: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to persist favorites', e);
      throw e;
    }
  }, []);

  const toggleFavorite = useCallback(
    async (animalId: string) => {
      const prevArray = queryClient.getQueryData<string[]>(['favorites']) ?? [];
      const prevSet = new Set(prevArray);

      const nextSet = new Set(prevSet);
      if (nextSet.has(animalId)) nextSet.delete(animalId);
      else nextSet.add(animalId);

      const nextArray = Array.from(nextSet);

      queryClient.setQueryData(['favorites'], nextArray);

      queryClient.setQueryData<Animal[]>(['animals'], (old = []) =>
        old.map((a) =>
          a.id === animalId ? { ...a, isFavorited: nextSet.has(animalId) } : a,
        ),
      );

      try {
        await persistFavorites(nextArray);
        showSuccess(
          'Favoritos',
          nextSet.has(animalId)
            ? 'Agregado a favoritos'
            : 'Eliminado de favoritos',
        );
      } catch (err) {
        queryClient.setQueryData(['favorites'], prevArray);
        queryClient.setQueryData<Animal[]>(['animals'], (old = []) =>
          old.map((a) =>
            a.id === animalId
              ? { ...a, isFavorited: prevSet.has(animalId) }
              : a,
          ),
        );
        showError('Error', 'No se pudo actualizar favorito');
        throw err;
      }
    },
    [persistFavorites, queryClient, showSuccess, showError],
  );

  const favoritesCount = useMemo(() => favoritesSet.size ?? 0, [favoritesSet]);

  const getFiltered = useCallback(
    (filters?: {
      especie?: string | null;
      sexo?: string | null;
      tamanio?: string | null;
      onlyFavorites?: boolean;
      id_raza?: number | null;
      id_estado_salud?: number | null;
    }) => {
      const f = filters ?? {};

      return animalsRaw.filter((a) => {
        if (f.onlyFavorites && !favoritesSet.has(a.id)) return false;

        if (
          f.id_raza &&
          f.id_raza !== null &&
          String(a.id_raza) !== String(f.id_raza)
        )
          return false;

        if (
          f.id_estado_salud &&
          f.id_estado_salud !== null &&
          String(a.id_estado_salud) !== String(f.id_estado_salud)
        )
          return false;

        if (f.especie && f.especie !== 'all' && a.species !== f.especie)
          return false;

        if (f.tamanio && f.tamanio !== 'all' && a.size !== f.tamanio)
          return false;

        return true;
      });
    },
    [animalsRaw, favoritesSet],
  );

  return {
    allAnimals: animalsRaw,
    getFiltered,
    favoritesSet,
    favoritesArray,
    favoritesCount,
    toggleFavorite,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
