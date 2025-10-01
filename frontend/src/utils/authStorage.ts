import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userAuthToken';

// Definir una interfaz para el objeto a exportar
// Ayuda al autocompletado y a la verificacion de tipos
interface IAuthStorage {
  saveToken: (token: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  removeToken: () => Promise<void>;
}

/**
 * Guarda el token de autenticacion en el almacenamiento seguro
 */
const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error al guardar el token', error);
    throw new Error('No se pudo guardar el token de autenticación.');
  }
};

/**
 * Obtiene el token de autenticacion desde el almacenamiento seguro.
 */
const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al obtener el token', error);
    return null;
  }
};

/**
 * Elimina el token de autenticacion del almacenamiento seguro.
 */
const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error al eliminar el token', error);
  }
};

export const authStorage: IAuthStorage = {
  saveToken,
  getToken,
  removeToken,
};