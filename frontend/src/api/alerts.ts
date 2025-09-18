import { apiClient } from "./client";
import { Alert } from "../types/alert";

// Obtener todas las alertas
export async function fetchAlerts(): Promise<Alert[]> {
  const res = await apiClient.get("/alerts");
  return res.data.data;
}

// Obtener una alerta por ID
export async function fetchAlertById(id: number): Promise<Alert> {
  const res = await apiClient.get(`/alerts/${id}`);
  return res.data.data;
}

// Actualizar una alerta
export async function updateAlert(id: number, updatedData: Partial<Alert>): Promise<Alert> {
  const res = await apiClient.put(`/alerts/${id}`, updatedData);
  return res.data.data;
}

// Eliminar una alerta
export async function deleteAlert(id: number): Promise<string> {
  const res = await apiClient.delete(`/alerts/${id}`);
  return res.data.message;
}
