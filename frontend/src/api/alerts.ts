import apiClient from './client';
import { Alert } from '../types/alert';

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
