import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Adopciones con validaciones Zod', () => {

  let jwtAdmin, jwtNormal;
  let createdAnimalId, createdAdoptionId, createdRequestId;

  // Helper para login
  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    // Limpiar datos de prueba
    await pool.query("DELETE FROM usuario WHERE email IN ($1, $2)",
      ['admin_adoption@test.com', 'user_adoption@test.com']);

    // Crear admin
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Admin',
        apellido_paterno: 'Adoption',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345678',
        email: 'admin_adoption@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });
    await pool.query("UPDATE usuario SET id_rol = 1 WHERE email = 'admin_adoption@test.com'");

    // Crear usuario normal
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'User',
        apellido_paterno: 'Adoption',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345679',
        email: 'user_adoption@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });

    jwtAdmin = await login('admin_adoption@test.com');
    jwtNormal = await login('user_adoption@test.com');

    // Crear animal y adopción para pruebas
    const animalRes = await pool.query(
      `INSERT INTO animal (nombre_animal, edad_animal, id_estado_salud, id_raza)
       VALUES ($1, $2, $3, $4) RETURNING id_animal`,
      ['Firulais Test', 5, 1, 1]
    );
    createdAnimalId = animalRes.rows[0].id_animal;

    const userRes = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = 'admin_adoption@test.com'"
    );
    const rescatistaId = userRes.rows[0].id_usuario;

    const adoptionRes = await pool.query(
      `INSERT INTO adopcion (id_animal, id_usuario_rescatista, descripcion, disponible)
       VALUES ($1, $2, $3, $4) RETURNING id_adopcion`,
      [createdAnimalId, rescatistaId, 'Perro en adopción', true]
    );
    createdAdoptionId = adoptionRes.rows[0].id_adopcion;
  });

  afterAll(async () => {
    // Limpiar datos creados
    if (createdRequestId) {
      await pool.query("DELETE FROM solicitud_adopcion WHERE id_solicitud_adopcion = $1", [createdRequestId]);
    }
    if (createdAdoptionId) {
      await pool.query("DELETE FROM adopcion WHERE id_adopcion = $1", [createdAdoptionId]);
    }
    if (createdAnimalId) {
      await pool.query("DELETE FROM animal WHERE id_animal = $1", [createdAnimalId]);
    }
    await pool.query("DELETE FROM usuario WHERE email IN ($1, $2)",
      ['admin_adoption@test.com', 'user_adoption@test.com']);
  });

  // -------------------- GET /api/adoption-requests --------------------
  describe('GET /api/adoption-requests', () => {
    test('debería listar solicitudes de adopción sin parámetros', async () => {
      const res = await request(app).get('/api/adoption-requests');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('debería validar limit como número', async () => {
      const res = await request(app)
        .get('/api/adoption-requests?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validación/i);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app)
        .get('/api/adoption-requests?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar offset como número', async () => {
      const res = await request(app)
        .get('/api/adoption-requests?offset=xyz');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/adoption-requests/:id --------------------
  describe('GET /api/adoption-requests/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .get('/api/adoption-requests/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validación/i);
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/adoption-requests/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/adoption-requests --------------------
  describe('POST /api/adoption-requests', () => {
    test('debería validar que id_adopcion sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/adoption-requests')
        .set('Authorization', `Bearer ${jwtNormal}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validación/i);
    });

    test('debería validar que id_adopcion sea un número', async () => {
      const res = await request(app)
        .post('/api/adoption-requests')
        .set('Authorization', `Bearer ${jwtNormal}`)
        .send({ id_adopcion: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería crear solicitud correctamente con datos válidos', async () => {
      const res = await request(app)
        .post('/api/adoption-requests')
        .set('Authorization', `Bearer ${jwtNormal}`)
        .send({ id_adopcion: createdAdoptionId });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_adopcion).toBe(createdAdoptionId);

      createdRequestId = res.body.data.id_solicitud_adopcion;
    });
  });

  // -------------------- PUT /api/adoption-requests/:id --------------------
  describe('PUT /api/adoption-requests/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .put('/api/adoption-requests/abc')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ id_estado_solicitud: 2 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_estado_solicitud sea obligatorio', async () => {
      const res = await request(app)
        .put(`/api/adoption-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validación/i);
    });

    test('debería validar que id_estado_solicitud sea un número', async () => {
      const res = await request(app)
        .put(`/api/adoption-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ id_estado_solicitud: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_estado_solicitud sea positivo', async () => {
      const res = await request(app)
        .put(`/api/adoption-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ id_estado_solicitud: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar solicitud correctamente con datos válidos', async () => {
      const res = await request(app)
        .put(`/api/adoption-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ id_estado_solicitud: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/adoption-requests/999999')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ id_estado_solicitud: 2 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /api/adoption-requests/:id --------------------
  describe('DELETE /api/adoption-requests/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .delete('/api/adoption-requests/abc')
        .set('Authorization', `Bearer ${jwtAdmin}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
