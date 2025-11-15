import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Avistamientos con validaciones Zod', () => {

  let jwtUser;
  let userId, createdSightingId;

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    // Obtener el id_usuario si existe
    const existingUser = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = 'user_sighting@test.com'"
    );

    if (existingUser.rows.length > 0) {
      const existingUserId = existingUser.rows[0].id_usuario;

      // Obtener todos los avistamientos del usuario
      const sightings = await pool.query(
        "SELECT id_avistamiento FROM avistamiento WHERE id_usuario = $1",
        [existingUserId]
      );

      // Eliminar fotos de avistamiento primero
      for (const row of sightings.rows) {
        await pool.query(
          "DELETE FROM avistamiento_foto WHERE id_avistamiento = $1",
          [row.id_avistamiento]
        );
      }

      // Eliminar avistamientos
      await pool.query("DELETE FROM avistamiento WHERE id_usuario = $1", [existingUserId]);
    }

    // Ahora es seguro eliminar el usuario
    await pool.query("DELETE FROM usuario WHERE email = 'user_sighting@test.com'");

    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'User',
        apellido_paterno: 'Sighting',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345682',
        email: 'user_sighting@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });

    jwtUser = await login('user_sighting@test.com');

    const userRes = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = 'user_sighting@test.com'"
    );
    userId = userRes.rows[0].id_usuario;
  });

  afterAll(async () => {
    // Limpiar todos los avistamientos del usuario de prueba
    if (userId) {
      // Obtener todos los avistamientos del usuario
      const sightings = await pool.query(
        "SELECT id_avistamiento FROM avistamiento WHERE id_usuario = $1",
        [userId]
      );

      // Eliminar fotos de avistamiento primero
      for (const row of sightings.rows) {
        await pool.query(
          "DELETE FROM avistamiento_foto WHERE id_avistamiento = $1",
          [row.id_avistamiento]
        );
      }

      // Eliminar avistamientos
      await pool.query("DELETE FROM avistamiento WHERE id_usuario = $1", [userId]);
    }

    await pool.query("DELETE FROM usuario WHERE email = 'user_sighting@test.com'");
  });

  // -------------------- GET /api/sightings --------------------
  describe('GET /api/sightings', () => {
    test('debería listar avistamientos sin parámetros', async () => {
      const res = await request(app).get('/api/sightings');
      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    test('debería validar limit como número', async () => {
      const res = await request(app).get('/api/sightings?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app).get('/api/sightings?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería aplicar filtros con id_especie', async () => {
      const res = await request(app).get('/api/sightings?id_especie=1');
      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
      }
    });

    test('debería validar que id_especie sea número', async () => {
      const res = await request(app).get('/api/sightings?id_especie=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/sightings/location --------------------
  describe('GET /api/sightings/location', () => {
    test('debería validar que latitude sea obligatoria', async () => {
      const res = await request(app).get('/api/sightings/location?longitude=-70.5');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que longitude sea obligatoria', async () => {
      const res = await request(app).get('/api/sightings/location?latitude=-33.5');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que latitude sea un número', async () => {
      const res = await request(app).get('/api/sightings/location?latitude=abc&longitude=-70.5');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de latitude', async () => {
      const res = await request(app).get('/api/sightings/location?latitude=100&longitude=-70.5');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de longitude', async () => {
      const res = await request(app).get('/api/sightings/location?latitude=-33.5&longitude=200');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/sightings/:id --------------------
  describe('GET /api/sightings/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app).get('/api/sightings/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/sightings/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/sightings --------------------
  describe('POST /api/sightings', () => {
    const validSighting = {
      id_estado_avistamiento: 1,
      id_estado_salud: 1,
      id_especie: 1,
      descripcion: 'Perro visto en el parque',
      ubicacion: {
        latitude: -33.4489,
        longitude: -70.6693
      },
      direccion: 'Parque Test, Santiago',
      url: 'https://example.com/photo.jpg'
    };

    test('debería validar que id_estado_avistamiento sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, id_estado_avistamiento: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_estado_salud sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, id_estado_salud: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_especie sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, id_especie: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que ubicacion sea obligatoria', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, ubicacion: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de ubicacion', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, ubicacion: { latitude: 'abc', longitude: 'xyz' } });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de latitude en ubicacion', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, ubicacion: { latitude: 100, longitude: -70 } });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de longitude en ubicacion', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, ubicacion: { latitude: -33, longitude: 200 } });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que descripcion no exceda 1000 caracteres', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, descripcion: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que direccion no exceda 255 caracteres', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, direccion: 'a'.repeat(256) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de URL si se proporciona', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validSighting, url: 'not-a-valid-url' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería crear avistamiento correctamente', async () => {
      const res = await request(app)
        .post('/api/sightings')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(validSighting);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.descripcion).toBe('Perro visto en el parque');

      createdSightingId = res.body.data.id_avistamiento;
    });
  });

  // -------------------- PUT /api/sightings/:id --------------------
  describe('PUT /api/sightings/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .put('/api/sightings/abc')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ descripcion: 'Updated' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que al menos un campo esté presente', async () => {
      const res = await request(app)
        .put(`/api/sightings/${createdSightingId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos un campo/i);
    });

    test('debería validar descripcion si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/sightings/${createdSightingId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ descripcion: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar ubicacion si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/sightings/${createdSightingId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ubicacion: { latitude: 100, longitude: -70 } });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar avistamiento correctamente', async () => {
      const res = await request(app)
        .put(`/api/sightings/${createdSightingId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          descripcion: 'Descripción actualizada',
          id_estado_salud: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/sightings/999999')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ descripcion: 'Test' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /api/sightings/:id --------------------
  describe('DELETE /api/sightings/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .delete('/api/sightings/abc')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
