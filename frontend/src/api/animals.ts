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
