import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import AnimalCard from './component/card';
import {
  fetchFavorites,
  removeFavorite as apiRemoveFavorite,
} from '@/src/api/favorite';
import { fetchAnimalById } from '@/src/api/animals';
import { Colors } from '@/src/constants/colors';
import { AppText, fontWeightSemiBold } from '@/src/components/AppText';
import { normalizeAnimal } from '@/src/utils/animalUtils';
import { Animal } from '@/src/types/animals';
import Spinner from '@/src/components/UI/Spinner';

type FavoriteRaw =
  | { id_favorito?: number; id_animal: number | string; animal?: any }
  | any;

export default function FavoritesScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const favs: FavoriteRaw[] = await fetchFavorites();

        const animalsFromFavs: Animal[] = [];
        const idsToFetch: (number | string)[] = [];

        favs.forEach((f) => {
          if (f?.animal) {
            animalsFromFavs.push(normalizeAnimal(f.animal));
          } else if (looksLikeAnimalObject(f)) {
            animalsFromFavs.push(normalizeAnimal(f));
          } else {
            const candidate = f.id_animal ?? f.id;
            if (candidate != null) idsToFetch.push(candidate);
          }
        });

        if (idsToFetch.length > 0) {
          const fetched = await Promise.all(
            idsToFetch.map(async (id) => {
              const idNum = Number(id);
              if (Number.isNaN(idNum)) {
                console.warn('favorites: invalid id, skipping', id);
                return null;
              }
              try {
                const a = await fetchAnimalById(idNum);
                return normalizeAnimal(a);
              } catch (e) {
                console.warn('No se pudo obtener animal favorito id:', id, e);
                return null;
              }
            }),
          );
          animalsFromFavs.push(...(fetched.filter(Boolean) as Animal[]));
        }

        if (mounted) {
          setAnimals(animalsFromFavs);
        }
      } catch (e: any) {
        console.error('Error cargando favoritos:', e);
        if (mounted) setError('No se pudieron cargar los favoritos.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleFavorite = async (animalId: string) => {
    setProcessingId(animalId);
    const prev = [...animals];
    try {
      setAnimals((prevList) =>
        prevList.filter((a) => String(a.id) !== String(animalId)),
      );
      await apiRemoveFavorite(animalId);
    } catch (e) {
      console.error('Error removiendo favorito:', e);
      setAnimals(prev);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <AppText style={{ fontWeight: fontWeightSemiBold }}>{error}</AppText>
      </View>
    );
  }

  if (animals.length === 0) {
    return (
      <View style={styles.center}>
        <AppText>No tienes favoritos aún</AppText>
        <Text style={{ marginTop: 8, color: '#90a4ae' }}>
          Marca animales con ❤️ para verlos aquí.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 30,
      }}
      data={animals}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <AnimalCard
          animal={item}
          currentPage={1}
          isFavorited={true}
          onToggleFavorite={() => handleToggleFavorite(String(item.id))}
        />
      )}
    />
  );
}

function looksLikeAnimalObject(obj: any) {
  if (!obj) return false;
  return Boolean(obj.id || obj.name || obj.nombre_animal || obj.edad_animal);
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
