// Configuracion del cliente para la comunicacion con la API
import { Platform } from 'react-native';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '../utils/authStorage';

let API_URL = 'http://localhost:3001/api'; // fallback

if (Platform.OS === 'android') {
  API_URL = 'http://10.0.2.2:3001/api'; // emulador Android
} else if (Platform.OS === 'ios') {
  API_URL = 'http://localhost:3001/api'; // simulador iOS
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 
 * Interceptor para inyectar el token en los headers
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default apiClient;
