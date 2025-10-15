import apiClient from "./client";

export async function fetchAdoptions() {
  const res = await apiClient.get("/adoptions");
  return res.data.data;
}

export async function createAdoption(adoptionData: { id_animal: number; id_usuario: number; }) {
  try {
    const res = await apiClient.post('/adoptions', adoptionData);
    return res.data.data;
  } catch (error: any) {
    console.error('API createAdoption error:', error.response?.data || error);
    throw error.response?.data || error;
  }
}