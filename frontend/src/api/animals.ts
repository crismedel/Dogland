import apiClient from "./client";

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