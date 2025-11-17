import apiClient from "./client";

// ---------------------------------------------------------
// FUNCIONES EXISTENTES (NO TOCAR)
// ---------------------------------------------------------

export async function fetchAnimals() {
  const res = await apiClient.get("/animals");
  return res.data.data;
}

export async function fetchAnimalById(id: number) {
  const res = await apiClient.get(`/animals/${id}`);
  return res.data.data;
}

export async function fetchAnimalByOrganization(id: number) {
  const res = await apiClient.get(`/animals/organization/${id}`);
  return res.data.data;
}

// Actualizar un animal
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

// Crear un nuevo animal
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

// ---------------------------------------------------------
// NUEVAS FUNCIONALIDADES (Agregadas para el formulario completo)
// ---------------------------------------------------------

// 1. Obtener catálogo de Especies
export async function fetchSpecies() {
  try {
    const res = await apiClient.get("/species");
    return res.data.data;
  } catch (error: any) {
    console.error('API fetchSpecies error:', error);
    return [];
  }
}

// 2. Obtener catálogo de Estados de Salud
export async function fetchHealthStates() {
  try {
    const res = await apiClient.get("/health-states");
    return res.data.data;
  } catch (error: any) {
    console.error('API fetchHealthStates error:', error);
    return [];
  }
}

// 3. Obtener catálogo de Razas (con filtro opcional)
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

// 4. Crear animal completo (Nuevo Endpoint con fotos)
// Apunta a /animalsPost para no chocar con el createAnimal anterior
export async function createFullAnimal(animalData: {
  nombre_animal: string;
  edad_animal?: number | null;
  edad_aproximada?: string | null;
  id_estado_salud: number;
  id_raza?: number | null;
  fotos?: string[]; // Array de URLs
}) {
  try {
    const res = await apiClient.post('/animalsPost', animalData);
    // Retornamos res.data completo porque suele traer { success, message, data }
    return res.data; 
  } catch (error: any) {
    console.error('API createFullAnimal error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}