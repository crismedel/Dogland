import pkg from 'pg';
import { NODE_ENV, PORT, DB_USER, DB_HOST, DB_NAME, DB_PASS, DB_PORT } from './config/env.js';
const { Pool } = pkg;

// Inicializar pool global
global.pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

// Limpiar tabla antes de cada test
beforeEach(async () => {
  await global.pool.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE');
});

// Cerrar pool al final
afterAll(async () => {
  await global.pool.end();
});
