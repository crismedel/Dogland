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
    id_ciudad: 546,
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

  // -------------------- POST /alerts --------------------
  test('crear alerta', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${jwtUser}`)
      .send({
        titulo: 'Alerta Test',
        descripcion: 'Prueba de alerta',
        id_tipo_alerta: 1,
        id_nivel_riesgo: 2,
        latitude: -33.45,
        longitude: -70.66,
        direccion: 'Santiago, Chile',
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titulo).toBe('Alerta Test');
    createdAlertId = res.body.data.id_alerta;
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

  // -------------------- PUT /alerts/:id --------------------
  test('actualizar alerta', async () => {
    const res = await request(app)
      .put(`/api/alerts/${createdAlertId}`)
      .set('Authorization', `Bearer ${jwtUser}`)
      .send({ titulo: 'Alerta Test Actualizada' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titulo).toBe('Alerta Test Actualizada');
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
