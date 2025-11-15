import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de manejo de Organizaciones', () => {

  let createdOrgId;

  const newOrgTemplate = {
    nombre_organizacion: 'Organizacion Test',
    telefono_organizacion: '+56912345678',
    email_organizacion: 'org@test.com',
    direccion: 'Calle Test 123',
    id_ciudad: 200
  };

  const updateOrgTemplate = {
    nombre_organizacion: 'Organizacion Actualizada',
    telefono_organizacion: '+56987654321',
    email_organizacion: 'org_updated@test.com'
  };

  beforeAll(async () => {
    // Limpiar organizaciones usadas en esta suite
    await pool.query("DELETE FROM organizacion WHERE email_organizacion IN ($1, $2)",
      ['org@test.com', 'org_updated@test.com']);
  });

  afterAll(async () => {
    // Limpiar organizaciones creadas por la suite
    await pool.query("DELETE FROM organizacion WHERE email_organizacion IN ($1, $2)",
      ['org@test.com', 'org_updated@test.com']);
  });

  // -------------------- GET /api/organizations --------------------
  describe('GET /api/organizations', () => {
    test('debería listar organizaciones sin parámetros', async () => {
      const res = await request(app).get('/api/organizations');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(50); // default
      expect(res.body.pagination.offset).toBe(0); // default
    });

    test('debería aplicar paginación con limit y offset', async () => {
      const res = await request(app)
        .get('/api/organizations?limit=10&offset=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.offset).toBe(5);
    });

    test('debería validar que limit sea un número válido', async () => {
      const res = await request(app)
        .get('/api/organizations?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/validación/i);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app)
        .get('/api/organizations?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que offset sea un número válido', async () => {
      const res = await request(app)
        .get('/api/organizations?offset=xyz');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería buscar organizaciones por nombre', async () => {
      const res = await request(app)
        .get('/api/organizations?search=test');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // -------------------- POST /api/organizations --------------------
  describe('POST /api/organizations', () => {
    test('debería crear una organización correctamente', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send(newOrgTemplate);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre_organizacion).toBe('Organizacion Test');
      expect(res.body.data.email_organizacion).toBe('org@test.com');

      createdOrgId = res.body.data.id_organizacion;
    });

    test('debería fallar si la organización ya existe (email duplicado)', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send(newOrgTemplate);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email/i);
    });

    test('debería validar que el nombre sea requerido', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({ ...newOrgTemplate, nombre_organizacion: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud mínima del nombre', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({ ...newOrgTemplate, nombre_organizacion: 'AB' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de email', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({
          ...newOrgTemplate,
          email_organizacion: 'email-invalido',
          nombre_organizacion: 'Test Org 2'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de teléfono', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({
          ...newOrgTemplate,
          telefono_organizacion: 'abc123xyz',
          nombre_organizacion: 'Test Org 3',
          email_organizacion: 'test3@test.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería fallar si la ciudad no existe', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({
          ...newOrgTemplate,
          id_ciudad: 999999,
          nombre_organizacion: 'Test Org 4',
          email_organizacion: 'test4@test.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/ciudad/i);
    });
  });

  // -------------------- GET /api/organizations/:id --------------------
  describe('GET /api/organizations/:id', () => {
    test('debería obtener organización por id', async () => {
      const res = await request(app)
        .get(`/api/organizations/${createdOrgId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_organizacion).toBe(createdOrgId);
      expect(res.body.data.nombre_organizacion).toBe('Organizacion Test');
    });

    test('debería fallar si la organización no existe', async () => {
      const res = await request(app)
        .get('/api/organizations/999999');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no encontrada/i);
    });

    test('debería validar que el id sea un número válido', async () => {
      const res = await request(app)
        .get('/api/organizations/abc');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- PUT /api/organizations/:id --------------------
  describe('PUT /api/organizations/:id', () => {
    test('debería actualizar una organización', async () => {
      const res = await request(app)
        .put(`/api/organizations/${createdOrgId}`)
        .send(updateOrgTemplate);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_organizacion).toBe(createdOrgId);
      expect(res.body.data.nombre_organizacion).toBe('Organizacion Actualizada');
      expect(res.body.data.email_organizacion).toBe('org_updated@test.com');
    });

    test('debería validar que se proporcione al menos un campo', async () => {
      const res = await request(app)
        .put(`/api/organizations/${createdOrgId}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería fallar si la organización no existe', async () => {
      const res = await request(app)
        .put('/api/organizations/999999')
        .send(updateOrgTemplate);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no encontrada/i);
    });

    test('debería fallar si la ciudad no existe', async () => {
      const res = await request(app)
        .put(`/api/organizations/${createdOrgId}`)
        .send({ id_ciudad: 999999 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/ciudad/i);
    });
  });

  // -------------------- GET /api/organizations/:id/users --------------------
  describe('GET /api/organizations/:id/users', () => {
    test('debería obtener usuarios de la organización', async () => {
      const res = await request(app)
        .get(`/api/organizations/${createdOrgId}/users`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeDefined();
    });

    test('debería filtrar usuarios activos', async () => {
      const res = await request(app)
        .get(`/api/organizations/${createdOrgId}/users?activo=true`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('debería filtrar usuarios inactivos', async () => {
      const res = await request(app)
        .get(`/api/organizations/${createdOrgId}/users?activo=false`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('debería validar el parámetro activo', async () => {
      const res = await request(app)
        .get(`/api/organizations/${createdOrgId}/users?activo=invalido`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /api/organizations/:id --------------------
  describe('DELETE /api/organizations/:id', () => {
    test('debería fallar si la organización tiene usuarios asociados', async () => {
      // Primero crear una org con usuarios
      const orgRes = await request(app)
        .post('/api/organizations')
        .send({
          nombre_organizacion: 'Org Con Usuarios',
          email_organizacion: 'orgconusuarios@test.com',
          id_ciudad: 200
        });

      const orgId = orgRes.body.data.id_organizacion;

      // Asociar un usuario a esta org (asumiendo que existe algun usuario en la BD)
      const usuarios = await pool.query('SELECT id_usuario FROM usuario LIMIT 1');
      if (usuarios.rows.length > 0) {
        await pool.query('UPDATE usuario SET id_organizacion = $1 WHERE id_usuario = $2',
          [orgId, usuarios.rows[0].id_usuario]);

        const deleteRes = await request(app)
          .delete(`/api/organizations/${orgId}`);

        expect(deleteRes.statusCode).toBe(409);
        expect(deleteRes.body.success).toBe(false);
        expect(deleteRes.body.message).toMatch(/usuario/i);

        // Limpiar: desasociar usuario
        await pool.query('UPDATE usuario SET id_organizacion = NULL WHERE id_usuario = $1',
          [usuarios.rows[0].id_usuario]);
      }

      // Limpiar la org creada
      await pool.query('DELETE FROM organizacion WHERE id_organizacion = $1', [orgId]);
    });

    test('debería eliminar una organización sin usuarios', async () => {
      const res = await request(app)
        .delete(`/api/organizations/${createdOrgId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/eliminada/i);
    });

    test('organización inexistente debería retornar 404', async () => {
      const res = await request(app)
        .delete(`/api/organizations/${createdOrgId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no encontrada/i);
    });

    test('debería validar que el id sea un número válido', async () => {
      const res = await request(app)
        .delete('/api/organizations/abc');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
