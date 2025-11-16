import apiClient from './client';

export interface FavoriteItem {
  id_favorito?: number;
  id_animal: number | string;
  id_usuario?: number | string;
  created_at?: string;
}

export async function fetchFavorites() {
  try {
    const res = await apiClient.get('/favorites');
    return res.data.data as FavoriteItem[];
  } catch (error: any) {
    console.error('API fetchFavorites error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}

export async function toggleFavorite(id_animal: number | string) {
  try {
    console.log(
      '🔍 toggleFavorite - id_animal:',
      id_animal,
      'type:',
      typeof id_animal,
    );

    const animalId = Number(id_animal);
    console.log(
      '🔍 toggleFavorite - converted:',
      animalId,
      'type:',
      typeof animalId,
    );

    const res = await apiClient.post('/favorites', { animal_id: animalId });
    return res.data;
  } catch (error: any) {
    console.error('API toggleFavorite error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}

export async function removeFavorite(id_animal: number | string) {
  try {
    // Asegurar que sea número
    const animalId = Number(id_animal);
    if (isNaN(animalId)) {
      throw new Error('animal_id debe ser un número válido');
    }

    const res = await apiClient.delete(`/favorites/${animalId}`);
    return res.data;
  } catch (error: any) {
    console.error('API removeFavorite error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}
