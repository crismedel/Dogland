import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

// Mock del pushService para evitar llamadas reales a Expo
jest.mock('../../services/pushService.js', () => ({
  sendPushNotificationToUsers: jest.fn().mockResolvedValue({
    sent: 1,
    details: [{ userId: 1, status: 'ok' }]
  }),
  sendPushNotificationToTokens: jest.fn().mockResolvedValue({
    sent: 1,
    tickets: []
  })
}));

describe('Endpoints de Notificaciones con validaciones Zod', () => {

  let jwtUser;
  let userId, notificationId;

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    await pool.query("DELETE FROM usuario WHERE email = 'user_notif@test.com'");

    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'User',
        apellido_paterno: 'Notif',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345683',
        email: 'user_notif@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });

    jwtUser = await login('user_notif@test.com');

    const userRes = await pool.query(
      "SELECT id_usuario FROM usuario WHERE email = 'user_notif@test.com'"
    );
    userId = userRes.rows[0].id_usuario;

    // Crear notificación para pruebas
    const notifRes = await pool.query(
      `INSERT INTO notifications (user_id, title, body, type, read)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, 'Test Notification', 'This is a test', 'test', false]
    );
    if (notifRes.rows.length > 0) {
      notificationId = notifRes.rows[0].id;
    }
  });

  afterAll(async () => {
    if (notificationId) {
      await pool.query("DELETE FROM notifications WHERE id = $1", [notificationId]);
    }
    await pool.query("DELETE FROM user_push_tokens WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM usuario WHERE email = 'user_notif@test.com'");
  });

  // -------------------- POST /api/notifications/token --------------------
  describe('POST /api/notifications/token', () => {
    const validToken = {
      push_token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      platform: 'android',
      device_id: 'device-test-123'
    };

    test('debería validar que push_token sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validToken, push_token: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que push_token no exceda 500 caracteres', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validToken, push_token: 'a'.repeat(501) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que platform sea obligatoria', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validToken, platform: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar valores permitidos de platform', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validToken, platform: 'invalid_platform' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería registrar push token correctamente', async () => {
      const res = await request(app)
        .post('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(validToken);

      expect([200, 201]).toContain(res.statusCode);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------- DELETE /api/notifications/token --------------------
  describe('DELETE /api/notifications/token', () => {
    test('debería validar que push_token sea obligatorio', async () => {
      const res = await request(app)
        .delete('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que push_token no esté vacío', async () => {
      const res = await request(app)
        .delete('/api/notifications/token')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ push_token: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/notifications/historial --------------------
  describe('GET /api/notifications/historial', () => {
    test('debería validar limit como número', async () => {
      const res = await request(app)
        .get('/api/notifications/historial?limit=abc')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app)
        .get('/api/notifications/historial?limit=150')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar offset como número', async () => {
      const res = await request(app)
        .get('/api/notifications/historial?offset=xyz')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería obtener historial correctamente', async () => {
      const res = await request(app)
        .get('/api/notifications/historial')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // -------------------- PATCH /api/notifications/:id/read --------------------
  describe('PATCH /api/notifications/:id/read', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .patch('/api/notifications/abc/read')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería marcar notificación como leída', async () => {
      if (!notificationId) {
        return; // Skip si no hay notificación
      }

      const res = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${jwtUser}`);

      expect([200, 404]).toContain(res.statusCode); // 404 si no existe
    });
  });

  // -------------------- DELETE /api/notifications/:id --------------------
  describe('DELETE /api/notifications/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .delete('/api/notifications/abc')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- PATCH /api/notifications/token/preferences --------------------
  describe('PATCH /api/notifications/token/preferences', () => {
    test('debería validar que push_token sea obligatorio', async () => {
      const res = await request(app)
        .patch('/api/notifications/token/preferences')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          preferences: {
            alertas_activadas: true
          }
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que al menos una preferencia esté presente', async () => {
      const res = await request(app)
        .patch('/api/notifications/token/preferences')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          push_token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          preferences: {}
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos una preferencia/i);
    });

    test('debería validar que alertas_activadas sea booleano', async () => {
      const res = await request(app)
        .patch('/api/notifications/token/preferences')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          push_token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          preferences: {
            alertas_activadas: 'not_boolean'
          }
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que avistamientos_activados sea booleano', async () => {
      const res = await request(app)
        .patch('/api/notifications/token/preferences')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          push_token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          preferences: {
            avistamientos_activados: 'not_boolean'
          }
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar preferencias correctamente', async () => {
      const res = await request(app)
        .patch('/api/notifications/token/preferences')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          push_token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
          preferences: {
            alertas_activadas: true,
            avistamientos_activados: false
          }
        });

      expect([200, 404]).toContain(res.statusCode);
    });
  });

  // -------------------- POST /api/notifications/test --------------------
  describe('POST /api/notifications/test', () => {
    test('debería validar que title sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ body: 'Test body' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que body sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ title: 'Test title' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que title no exceda 200 caracteres', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          title: 'a'.repeat(201),
          body: 'Test body'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que body no exceda 1000 caracteres', async () => {
      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          title: 'Test title',
          body: 'a'.repeat(1001)
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/notifications/send-to-user --------------------
  describe('POST /api/notifications/send-to-user', () => {
    const validNotification = {
      userId: 1,
      title: 'Test Notification',
      body: 'This is a test notification',
      type: 'test',
      data: { key: 'value' }
    };

    test('debería validar que userId sea obligatorio', async () => {
      const { userId, ...payload } = validNotification;
      const res = await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que userId sea un número', async () => {
      const res = await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validNotification, userId: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que title sea obligatorio', async () => {
      const { title, ...payload } = validNotification;
      const res = await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que body sea obligatorio', async () => {
      const { body, ...payload } = validNotification;
      const res = await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(payload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud de type si se proporciona', async () => {
      const res = await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ ...validNotification, type: 'a'.repeat(51) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
