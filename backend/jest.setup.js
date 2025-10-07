import pkg from 'pg';
import request from 'supertest';
import app from './index.js';
import { DB_USER, DB_HOST, DB_NAME, DB_PASS, DB_PORT } from './config/env.js';
const { Pool } = pkg;

let jwtToken;

// Inicializar pool global
global.pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

// Se ejecuta antes de todos los test
beforeAll(async () => {
  // Limpiar DB antes de generar usuario
  await global.pool.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE');
  // Crear un usuario de prueba y generar token
  await request(app)
    .post('/api/auth/register')
    .send({
      nombre_usuario: 'Test',
      apellido_paterno: 'Test',
      apellido_materno: 'Test',
      id_sexo: 1,
      fecha_nacimiento: '2001-01-01',
      telefono: '912345678',
      email: 'test@test.com',
      password_hash: '123456',
      id_ciudad: 546,
    });

  const login = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'test@test.com',
      password: '123456'
    });

  jwtToken = login.body.token;
  global.jwtToken = jwtToken; // jwt global para usar en cualquier test
});

// Se ejecuta antes de cada test
beforeEach(async () => {
});

// Se ejecuta al de todos los test
afterAll(async () => {
  await global.pool.end();
});
