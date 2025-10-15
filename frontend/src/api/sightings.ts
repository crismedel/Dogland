
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
