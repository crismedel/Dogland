import dotenv from 'dotenv';
import path from 'path';

// Determinar que archivo cargar segun NODE_ENV
const envFile =
  process.env.NODE_ENV === 'test' ? '.env.test' :
  process.env.NODE_ENV === 'production' ? '.env.production' :
  '.env';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Exportar las variables importantes de manera centralizada
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3001;
export const JWT_SECRET = process.env.JWT_SECRET;

export const DB_USER = process.env.DB_USER;
export const DB_HOST = process.env.DB_HOST;
export const DB_NAME = process.env.DB_NAME;
export const DB_PASS = process.env.DB_PASS;
export const DB_PORT = process.env.DB_PORT;

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
