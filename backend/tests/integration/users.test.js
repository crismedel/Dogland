import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de manejo de Usuarios protegidos con JWT', () => {

  let jwtAdmin, jwtNormal;
  let validToken, invalidToken;
  let createdUserId;

  const newUserTemplate = {
    nombre_usuario: 'Test',
    apellido_paterno: 'Test',
    apellido_materno: 'Test',
    id_sexo: 1,
    fecha_nacimiento: '2001-01-01',
    telefono: '912345678',
    password_hash: 'password123',
    id_ciudad: 200,
    id_organizacion: null,
    id_rol: 2,
  };

  const updateUserTemplate = { ...newUserTemplate };

  // Helper para login
  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  // Crear admin y usuario normal solo para esta suite
  beforeAll(async () => {
    // Limpiar usuarios usados en esta suite
    await pool.query("DELETE FROM usuario WHERE email IN ($1, $2, $3)", ['admin@test.com', 'normal@test.com', 'update@test.com']);

    // Crear admin
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Admin',
        apellido_paterno: 'Test',
        apellido_materno: 'User',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345678',
        email: 'admin@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });
    await pool.query("UPDATE usuario SET id_rol = 1 WHERE email = 'admin@test.com'");

    // Crear usuario normal
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Normal',
        apellido_paterno: 'Test',
        apellido_materno: 'User',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345679',
        email: 'normal@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });

    // Generar JWTs
    jwtAdmin = await login('admin@test.com');
    jwtNormal = await login('normal@test.com');

    global.jwtAdmin = jwtAdmin;
    global.jwtNormal = jwtNormal;

    validToken = jwtAdmin;
    invalidToken = validToken.slice(0, -1) + 'x';
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  // Limpiar usuarios creados por la suite
  afterAll(async () => {
    await pool.query("DELETE FROM usuario WHERE email IN ($1, $2, $3, $4)", ['admin@test.com', 'normal@test.com', 'createuser@test.com', 'update@test.com']);
  });


  // -------------------- GET /api/users --------------------
  describe('GET /api/users', () => {
    test('requiere autenticación', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('deberia fallar por permisos', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${global.jwtNormal}`);
      expect(res.statusCode).toBe(403);
      expect(Array.isArray(res.body.data)).toBe(false);
    });


    test('sin token debe fallar', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });

    test('con token inválido debe fallar', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${invalidToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/token/i);
    });
  });

  // -------------------- POST /api/users --------------------
  describe('POST /api/users', () => {
    test('deberia crear un usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ ...newUserTemplate, email: 'createuser@test.com' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre_usuario).toBe('Test');
      expect(res.body.data.email).toBe('createuser@test.com');

      createdUserId = res.body.data.id_usuario;
    });

    test('deberia fallar si el usuario existe', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ ...newUserTemplate, email: 'createuser@test.com' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/users/profile --------------------
  describe('GET /api/users/profile', () => {
    test('deberia permitir ver perfil', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------- PUT /api/users/profile --------------------
  describe('PUT /api/users/profile', () => {
    test('debería validar que al menos un campo esté presente', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos un campo/i);
    });

    test('debería validar longitud mínima de nombre_usuario', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ nombre_usuario: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud máxima de nombre_usuario', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ nombre_usuario: 'a'.repeat(51) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud máxima de apellido_paterno', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ apellido_paterno: 'a'.repeat(31) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de email', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ email: 'invalid-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de teléfono', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ telefono: 'abc123xyz' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud mínima de password_hash', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ password_hash: '12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de fecha_nacimiento', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ fecha_nacimiento: 'invalid-date' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_sexo sea un número', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ id_sexo: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_ciudad sea un número', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({ id_ciudad: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar perfil correctamente', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${global.jwtNormal}`)
        .send({
          nombre_usuario: 'Updated Name',
          telefono: '987654321'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre_usuario).toBe('Updated Name');
    });

    test('debería requerir autenticación', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ nombre_usuario: 'Test' });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });
  });

  // -------------------- GET /api/users/:id ------------------------
  describe('GET /api/users/:id', () => {
    test('debería obtener usuario por id', async () => {
      const res = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
      expect(res.body.data.email).toBe('createuser@test.com');
    });

    test('debería fallar si el usuario no existe', async () => {
      const res = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- PUT /api/users/:id --------------------
  describe('PUT /api/users/:id', () => {
    test('debería actualizar un usuario', async () => {
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ ...updateUserTemplate, email: 'update@test.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
      expect(res.body.data.email).toBe('update@test.com');
    });

    test('debería fallar si la ciudad no existe', async () => {
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ ...updateUserTemplate, id_ciudad: 999999 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería fallar si el usuario no existe', async () => {
      const res = await request(app)
        .put('/api/users/99')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ ...updateUserTemplate });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- PATCH /api/users/:id/deactivate --------------------
  describe('PATCH /api/users/:id/deactivate', () => {
    test('debería desactivar el usuario', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/deactivate`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
    });

    test('usuario ya desactivado debería retornar éxito', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/deactivate`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
    });

    test('deberia retornar usuario no encontrado' , async () => {
      const res = await request(app)
        .patch(`/api/users/999999/deactivate`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false)
    });
  });

  // -------------------- PATCH /api/users/:id/activate --------------------
  describe('PATCH /api/users/:id/activate', () => {
    test('debería activar el usuario', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}/activate`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
    });
    
    test('deberia retornar usuario no encontrado' , async () => {
      const res = await request(app)
        .patch(`/api/users/999999/activate`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false)
    });
  });

  // -------------------- DELETE /api/users/:id --------------------
  describe('DELETE /api/users/:id', () => {
    test('debería eliminar un usuario por id', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(createdUserId);
    });

    test('usuario inexistente debería retornar 404', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
