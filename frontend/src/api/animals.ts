import apiClient from "./client";

// --- HELPER: Función para traducir datos del Backend al Frontend ---
const mapBackendToFrontend = (item: any) => ({
  id: item.id_animal,
  name: item.nombre_animal,
  // Priorizamos la edad exacta, si es null usamos la aproximada
  age: item.edad_animal, 
  ageText: item.edad_aproximada, 
  size: item.tamaño,
  
  // Textos directos del backend
  breed: item.nombre_raza || 'Desconocida', 
  healthStatus: item.estado_salud || 'Desconocido', // "Saludable", "Herido", etc.
  
  // Imagen: Primera foto del array o null
  imageUrl: (item.fotos && item.fotos.length > 0) ? item.fotos[0].url : null,
  
  // Descripción
  descripcionMedica: item.descripcion_adopcion || ''
});

// ---------------------------------------------------------
// FUNCIONES
// ---------------------------------------------------------

export async function fetchAnimals() {
  try {
    const res = await apiClient.get("/animals");
    const rawData = res.data.data || [];
    // Usamos el helper para mapear la lista
    return rawData.map(mapBackendToFrontend);
  } catch (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
}

export async function fetchAnimalById(id: number) {
  try {
    const res = await apiClient.get(`/animals/${id}`);
    // ¡AHORA SÍ! Mapeamos también el detalle individual
    return mapBackendToFrontend(res.data.data);
  } catch (error) {
    console.error('Error fetching animal by ID:', error);
    throw error;
  }
}

export async function fetchAnimalByOrganization(id: number) {
  const res = await apiClient.get(`/animals/organization/${id}`);
  // Mapeamos también aquí por si acaso
  const rawData = res.data.data || [];
  return rawData.map(mapBackendToFrontend);
}

// ... (El resto del archivo: updateAnimal, createAnimal, createFullAnimal, etc. SE QUEDA IGUAL)
// Asegúrate de mantener las funciones de createFullAnimal, fetchSpecies, etc. que ya tenías abajo.
// Solo reemplaza la parte superior con este código.

// ... (Resto del código existente)
export async function updateAnimal(
  id: number,
  updatedData: {
    nombre_animal?: string;
    edad_animal?: number;
    edad_aproximada?: string;
    id_estado_salud?: number;
    id_raza?: number;
  },
) {
  try {
    const res = await apiClient.put(`/animals/${id}`, updatedData);
    return res.data.data;
  } catch (error: any) {
    console.error('API updateAnimal error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}

export async function createAnimal(newAnimalData: {
  nombre_animal: string;
  edad_animal: number;
  edad_aproximada: string;
  id_estado_salud: number;
  id_raza: number;
}) {
  try {
    const res = await apiClient.post('/animals', newAnimalData);
    return res.data.data;
  } catch (error: any) {
    console.error('API createAnimal error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}

export async function fetchSpecies() {
  try {
    const res = await apiClient.get("/species");
    return res.data.data;
  } catch (error: any) {
    console.error('API fetchSpecies error:', error);
    return [];
  }
}

export async function fetchHealthStates() {
  try {
    const res = await apiClient.get("/health-states");
    return res.data.data;
  } catch (error: any) {
    console.error('API fetchHealthStates error:', error);
    return [];
  }
}

export async function fetchRaces(idEspecie?: number | string) {
  try {
    const url = idEspecie ? `/races?id_especie=${idEspecie}` : '/races';
    const res = await apiClient.get(url);
    return res.data.data;
  } catch (error: any) {
    console.error('API fetchRaces error:', error);
    return [];
  }
}

export async function createFullAnimal(animalData: {
  nombre_animal: string;
  edad_animal?: number | null;
  edad_aproximada?: string | null;
  id_estado_salud: number;
  id_raza?: number | null;
  fotos?: string[];
}) {
  try {
    const res = await apiClient.post('/animalsPost', animalData);
    return res.data; 
  } catch (error: any) {
    console.error('API createFullAnimal error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}