import apiClient from './client';

// Obtener todos los avistamientos
export const fetchSightings = async () => {
  const response = await apiClient.get('/sightings');
  return response.data.data;
};

// Obtener un avistamiento por ID
export const fetchSightingById = async (id: number) => {
  const response = await apiClient.get(`/sightings/${id}`);
  return response.data.data;
};

// Verificar si un avistamiento existe
export const checkSightingExists = async (id: number): Promise<boolean> => {
  try {
    await fetchSightingById(id);
    return true;
  } catch (error: any) {
    if (error?.status === 404 || error?.response?.status === 404) {
      return false;
    }
    throw error;
  }
};
