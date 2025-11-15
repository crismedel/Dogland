// /Dogland/frontend/src/api/razaAnimalesAdop.ts
import apiClient from './client';

export interface Race {
  id_raza: number;
  nombre_raza: string;
}

export async function fetchRaces(): Promise<Race[]> {
  const res = await apiClient.get('/races');
  return res.data.data;
}