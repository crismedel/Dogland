import request from 'supertest';
import app from './app.js';
import pool from './db/db.js';

/**
 * Inicializa el ambiente de testing de integracion, creando
 * un usuario por rol para probar en los endpoints
 */


/* TODO: 
        - * el admin no deberia editar, ver, ni manejar el password_hash
        - crear test para los endpoints:
          - auth
          - regions
          - sightings
          - cities
          - animals
          - adoptions
        */

let jwtNormal, jwtAdmin, jwtWorker;

// Helper para hacer login
async function login(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: '123456' });
  return res.body.token;
}

// Se ejecuta antes de todos los test
beforeAll(async () => {
  // Limpiar DB antes de generar usuario
  await pool.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE');

  // Crear tres usuarios de prueba
  const emails = [
    'admin@test.com',
    'normal@test.com',
    'worker@test.com'
  ];

  // Crear 3 usuarios iguales pero con distinto rol
  for (const email of emails) {
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Test',
        apellido_paterno: 'Test',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2001-01-01',
        telefono: '912345678',
        email,
        password_hash: '123456',
        id_ciudad: 546,
    });
  }

  // Cambiar roles en la DB
  await pool.query("UPDATE usuario SET id_rol = 1 WHERE email = 'admin@test.com'");
  await pool.query("UPDATE usuario SET id_rol = 3 WHERE email = 'worker@test.com'");

  // Obtener los jwt de cada usuario creado
  jwtAdmin = await login(emails[0]);
  jwtNormal = await login(emails[1]);
  jwtWorker = await login(emails[2]);
  
  // JWT globales para usar en test
  global.jwtAdmin = jwtAdmin;
  global.jwtNormal = jwtNormal;
  global.jwtWorker = jwtWorker;
});

// Se ejecuta antes de cada test
beforeEach(async () => {
});

// Se ejecuta al de todos los test
afterAll(async () => {
  await pool.end();
});
