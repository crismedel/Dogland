// Manejar peticiones HTTP para endpoint usuarios
import { User } from '../types/user';
import apiClient from './client';

// Esto no funcionara por los permisos porsiaca
export async function fetchUsers(): Promise<User[]> {
  const res = await apiClient.get('/users');
  return res.data.data;
}

// Obtener perfil del usuario autenticado
export async function fetchUserProfile(): Promise<User> {
  const res = await apiClient.get('/users/profile');
  return res.data.data;
}