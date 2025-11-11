import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';
import { sendPushNotificationToUsers } from '../../middlewares/pushNotifications.js';

jest.mock('../../middlewares/pushNotifications.js', () => ({
  sendPushNotificationToUsers: jest.fn().mockResolvedValue(true),
}));

describe('Endpoints de Alertas', () => {
  let jwtUser;
  let createdAlertId;

  const newUser = {
    nombre_usuario: 'AlertTest',
    apellido_paterno: 'User',
    apellido_materno: 'Test',
    id_sexo: 1,
    fecha_nacimiento: '2000-01-01',
    telefono: '912345678',
    email: 'alerttest@test.com',
    password_hash: '123456',
    id_ciudad: 200,
  };

  beforeAll(async () => {
    // Limpiar cualquier usuario de prueba
    await pool.query('DELETE FROM usuario WHERE email = $1', [newUser.email]);

    // Crear usuario de prueba
    await request(app)
      .post('/api/auth/register')
      .send(newUser);

    // Login y obtener JWT
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: newUser.email,
        password: newUser.password_hash
      });

    jwtUser = resLogin.body.token;
  });

  afterAll(async () => {
    // Limpiar usuario y alertas creadas
    await pool.query('DELETE FROM alerta WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE email = $1)', [newUser.email]);
    await pool.query('DELETE FROM usuario WHERE email = $1', [newUser.email]);
  });

  // -------------------- GET /alerts con validaciones --------------------
  describe('GET /api/alerts - Validaciones', () => {
    test('debería validar limit como número', async () => {
      const res = await request(app).get('/api/alerts?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app).get('/api/alerts?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar offset como número', async () => {
      const res = await request(app).get('/api/alerts?offset=xyz');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /alerts/:id con validaciones --------------------
  describe('GET /api/alerts/:id - Validaciones', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app).get('/api/alerts/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /alerts con validaciones --------------------
  describe('POST /api/alerts - Validaciones', () => {
    const validAlert = {
      titulo: 'Alerta Test',
      descripcion: 'Prueba de alerta',
      id_tipo_alerta: 1,
      id_nivel_riesgo: 2,
      latitude: -33.45,
      longitude: -70.66,
      direccion: 'Santiago, Chile',
    };

    test('debería validar que titulo sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, titulo: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que titulo no exceda 100 caracteres', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, titulo: 'a'.repeat(101) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que descripcion sea obligatoria', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, descripcion: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que descripcion no exceda 1000 caracteres', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, descripcion: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_tipo_alerta sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, id_tipo_alerta: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_nivel_riesgo sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, id_nivel_riesgo: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de latitude', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, latitude: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de longitude', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, longitude: 200 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que direccion no exceda 255 caracteres', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validAlert, direccion: 'a'.repeat(256) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería crear alerta correctamente', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(validAlert);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.titulo).toBe('Alerta Test');
      createdAlertId = res.body.data.id_alerta;
    });
  });

  // -------------------- GET /alerts --------------------
  test('listar alertas activas', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${jwtUser}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // -------------------- GET /alerts/:id --------------------
  test('obtener alerta específica', async () => {
    const res = await request(app)
      .get(`/api/alerts/${createdAlertId}`)
      .set('Authorization', `Bearer ${jwtUser}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id_alerta).toBe(createdAlertId);
  });

  // -------------------- PUT /alerts/:id con validaciones --------------------
  describe('PUT /api/alerts/:id - Validaciones', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .put('/api/alerts/abc')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ titulo: 'Updated' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que al menos un campo esté presente', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos un campo/i);
    });

    test('debería validar titulo si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ titulo: 'a'.repeat(101) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar descripcion si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ descripcion: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar rango de latitude si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ latitude: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar alerta correctamente', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ titulo: 'Alerta Test Actualizada' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.titulo).toBe('Alerta Test Actualizada');
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/alerts/999999')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ titulo: 'Test' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /alerts/:id --------------------
  test('eliminar alerta', async () => {
    const res = await request(app)
      .delete(`/api/alerts/${createdAlertId}`)
      .set('Authorization', `Bearer ${jwtUser}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/eliminada/i);
  });
});
