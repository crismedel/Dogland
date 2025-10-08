import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de manejo de Usuarios protegidos con JWT', () => {
  
  let validToken;
  let invalidToken;

  beforeAll(() => {
    // Obtener token global
    validToken = global.jwtToken;
    invalidToken = validToken ? validToken.slice(0, -1) + 'x' : 'invalidtoken';
  });


  test('GET /api/users - requiere autenticación', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send();
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });


  test('GET /api/users - simula DB caída', async () => {
    const originalPool = pool.query;
    pool.query = () => { throw new Error('DB caída'); }

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);

    // Restaurar pool
    pool.query = originalPool;
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


  test('POST /api/users - deberia crear un usuario correctamente', async () => {
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
      .set('Authorization', `Bearer ${validToken}`)
      .send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre_usuario).toBe('Test');
    expect(res.body.data.email).toBe('createuser@test.com');

    //createdUserId = res.body.data.id; 
    createdUserId = res.body.data.id_usuario;
  });


  test('PATCH /api/users/:id/deactivate - debería desactivar el usuario', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/deactivate`)
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Usuario desactivado correctamente');
    expect(res.body.data.id_usuario).toBe(createdUserId);
    expect(res.body.data.email).toBe('createuser@test.com');
  });


  test('PATCH /api/users/:id/deactivate - usuario ya desactivado debería retornar éxito', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/deactivate`)
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id_usuario).toBe(createdUserId);
  });

  
  test('PATCH /api/users/:id/activate - debería activar el usuario', async () => {
    const res = await request(app)
      .patch(`/api/users/${createdUserId}/activate`)
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Usuario activado correctamente');
    expect(res.body.data.id_usuario).toBe(createdUserId);
    expect(res.body.data.email).toBe('createuser@test.com');
  });


  test('DELETE /api/users/:id - debería eliminar un usuario por id', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Usuario eliminado correctamente');
    expect(res.body.data.id_usuario).toBe(createdUserId);
    expect(res.body.data.email).toBe('createuser@test.com');
  });


  test('DELETE /api/users/:id - usuario inexistente debería retornar 404', async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Usuario no encontrado');
  });
});
