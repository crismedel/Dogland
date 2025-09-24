import request from 'supertest';
import app from '../index.js';
import pool from '../db/db.js';
//Probar el test:
//  npm test

describe('POST /api/users', () => {
  // Limpiar la tabla antes y despues de cada prueba
  beforeEach(async () => {
    // TODO: crear una bd de prueba, esta cosita borra la tabla completa
    await pool.query('TRUNCATE TABLE usuario RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end(); // cerrar conexion
  });

  test('Deberia crear un usuario correctamente', async () => {
    const newUser = {
      nombre_usuario: 'Juan',
      apellido_paterno: 'Test',
      apellido_materno: 'Test',
      id_sexo: 1,
      fecha_nacimiento: '2001-01-01',
      telefono: '912345678',
      email: 'juan@test.com',
      password_hash: 'password123',
      id_ciudad: 546,
      id_organizacion: null,
      id_rol: 2
    };

    const res = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre_usuario).toBe('Juan');
    expect(res.body.data.email).toBe('juan@test.com');
  });

  test('Deberia fallar si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ nombre_usuario: 'Ana' }); // faltan campos

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Faltan campos obligatorios/);
  });
});
