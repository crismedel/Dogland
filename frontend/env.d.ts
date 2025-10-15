// Declarar los tipos para las variables de entorno
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string;
    EXPO_PUBLIC_API_URL_ANDROID: string;
    EXPO_PUBLIC_API_URL_IOS: string;
  }
}