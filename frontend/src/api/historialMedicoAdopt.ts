// /Dogland/frontend/src/api/historialMedicoAdopt.ts
import apiClient from './client';

export interface HealthState {
  id_estado_salud: number;
  estado_salud: string;
}

export async function fetchHealthStates(): Promise<HealthState[]> {
  const res = await apiClient.get('/health-states');
  return res.data.data;
}