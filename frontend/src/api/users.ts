// Manejar peticiones HTTP para endpoint usuarios
import { apiClient } from "./client";
import { User, UsersResponse } from "../types/user";


export async function fetchUsers(): Promise<User[]> {
  const res = await apiClient.get("/users");
  return res.data.data;
}
