import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints protegidos con JWT', () => {
  

  let validToken;
  let invalidToken;

  beforeAll(() => {
    validToken = global.jwtToken;
    invalidToken = validToken ? validToken.slice(0, -1) + 'x' : 'invalidtoken';
  });

  test('GET /api/users - requiere autenticación', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`) // usar token global
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); //devuelve array de usuarios
  });

  test('GET /api/users - sin token debe fallar', async () => {
    const res = await request(app)
      .get('/api/users')
      .send();

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/token/i);
  });

  test('GET /api/users - con token inválido debe fallar', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send();

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/token/i);
  });

  test('POST /api/users - Deberia crear un usuario correctamente', async () => {
    const newUser = {
      nombre_usuario: 'Test',
      apellido_paterno: 'Test',
      apellido_materno: 'Test',
      id_sexo: 1,
      fecha_nacimiento: '2001-01-01',
      telefono: '912345678',
      email: 'createuser@test.com',
      password_hash: 'password123',
      id_ciudad: 546,
      id_organizacion: null,
      id_rol: 2,
    }
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${global.jwtToken}`)
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre_usuario).toBe('Test');
    expect(res.body.data.email).toBe('createuser@test.com');
  });
});
