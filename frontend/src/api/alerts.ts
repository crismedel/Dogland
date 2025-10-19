import apiClient from './client';
import { authStorage } from '../utils/authStorage';
import { Alert } from '../types/alert';

// Define la interfaz para una alerta activa.
// Ajusta esto según la estructura real de tus alertas en el backend.
export interface ActiveAlert {
  id_alerta: number;
  titulo: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  estado: 'activa' | 'resuelta'; // O los estados que manejes
  // Agrega cualquier otro campo relevante de tu alerta
}

/**
 * Obtiene todas las alertas activas del usuario autenticado.
 * Requiere un token JWT válido.
 * @returns Una promesa que resuelve con un array de ActiveAlert.
 */
export const fetchActiveAlerts = async (): Promise<ActiveAlert[]> => {
  const token = await authStorage.getToken();

  if (!token) {
    console.warn(
      'No hay token de autenticación disponible para fetchActiveAlerts.',
    );
    return [];
  }

  try {
    const response = await apiClient.get<{
      success: boolean;
      alertas: ActiveAlert[];
    }>(
      '/alerts/active', // Asegúrate de que este sea el endpoint correcto en tu backend
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data.alertas;
  } catch (error) {
    console.error('Error al obtener alertas activas:', error);
    throw error;
  }
};

// Obtener todas las alertas
export async function fetchAlerts(): Promise<Alert[]> {
  const res = await apiClient.get('/alerts');
  return res.data.data;
}

// Obtener una alerta por ID
export async function fetchAlertById(id: number): Promise<Alert> {
  const res = await apiClient.get(`/alerts/${id}`);
  return res.data.data;
}

// Actualizar una alerta
export async function updateAlert(
  id: number,
  updatedData: Partial<Alert> & {
    id_tipo_alerta?: number;
    id_nivel_riesgo?: number;
  },
): Promise<Alert> {
  try {
    const res = await apiClient.put(`/alerts/${id}`, updatedData);
    return res.data.data;
  } catch (error: any) {
    console.error(
      'API updateAlert error:',
      error.response?.data || error.message || error,
    );
    throw error.response?.data || error;
  }
}

// Eliminar una alerta
export async function deleteAlert(id: number): Promise<string> {
  try {
    const res = await apiClient.delete(`/alerts/${id}`);
    return res.data.message;
  } catch (error: any) {
    console.error(
      'API deleteAlert error:',
      error.response?.data || error.message || error,
    );
    throw error.response?.data || error;
  }
}

export async function createAlert(
  data: Partial<Alert> & { id_tipo_alerta: number; id_nivel_riesgo: number },
): Promise<Alert> {
  try {
    const res = await apiClient.post('/alerts', data);
    return res.data.data;
  } catch (error: any) {
    console.error(
      'API createAlert error:',
      error.response?.data || error.message || error,
    );
    throw error.response?.data || error;
  }
}
