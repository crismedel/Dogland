import apiClient from "./client";

// Tipos para los datos del formulario
interface HistorialMedicoPayload {
  diagnostico: string;
  tratamiento: string;
  fecha_examen: string;
}

interface FullAnimalPayload {
  nombre_animal: string;
  edad_animal: number | null;
  size: string;
  id_raza: any;
  id_estado_salud: any;
  descripcion_adopcion: string;
  foto_url: string;
  historial_medico: HistorialMedicoPayload;
}

export async function createFullAnimal(animalData: FullAnimalPayload) {
  try {
    const res = await apiClient.post('/full-animal', animalData);
    return res.data; // Devuelve la respuesta completa (incluye .success y .message)
  } catch (error: any) {
    console.error('API createFullAnimal error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}