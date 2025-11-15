import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';
import crypto from 'crypto';

describe('Endpoints de Autenticación', () => {
  let validToken;
  let invalidToken;
  let resetToken;
  let testUserId;
  
  const testUser = {
    nombre_usuario: 'AuthTest',
    apellido_paterno: 'User',
    apellido_materno: 'Test',
    id_sexo: 1,
    fecha_nacimiento: '2000-01-01',
    telefono: '987654321',
    email: 'authtest@test.com',
    password_hash: 'testpass123',
    id_ciudad: 200,
  };

  // Funcion helper para limpiar datos del usuario de prueba
  const cleanupTestUser = async () => {
    try {
      // Obtener el id_usuario si existe
      const userResult = await pool.query(
        'SELECT id_usuario FROM usuario WHERE email = $1',
        [testUser.email]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id_usuario;

        // Eliminar en orden de dependencias
        await pool.query('DELETE FROM password_reset WHERE id_usuario = $1', [userId]);
        await pool.query('DELETE FROM audit_logs WHERE id_audit_log = $1 AND table_name = $2', [userId, 'usuario']);
        await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [userId]);
      }
    } catch (error) {
      console.error('Error en limpieza de usuario de prueba:', error.message);
    }
  };

  // Limpiar datos antes de iniciar
  beforeAll(async () => {
    validToken = global.jwtNormal;
    invalidToken = validToken ? validToken.slice(0, -1) + 'x' : 'invalidtoken';
    
    // Limpiar usuario de prueba si existe
    await cleanupTestUser();
  });

  // Limpiar todos los datos creados despues de completar los tests
  afterAll(async () => {
    await cleanupTestUser();
  });

  // -------------------- POST /api/auth/register --------------------
  describe('POST /api/auth/register', () => {
    test('debería registrar un nuevo usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Si falla, mostrar el error para debugging
      if (res.statusCode !== 201) {
        console.log('Error en registro:', res.body);
      }

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/registrado exitosamente/i);
      expect(res.body.id).toBeDefined();
      
      testUserId = res.body.id;
    });

    test('debería fallar si el usuario ya existe', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/ya existe/i);
    });

    test('debería fallar si faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre_usuario: 'Test',
          email: 'incomplete@test.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/campos obligatorios/i);
    });

    test('debería fallar con email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalidemail',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería fallar con ciudad inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'newuser@test.com',
          id_ciudad: 999999,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/auth/login --------------------
  describe('POST /api/auth/login', () => {
    test('debería iniciar sesión correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password_hash,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/inicio de sesión exitoso/i);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
    });

    test('debería fallar con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/credenciales inválidas/i);
    });

    test('debería fallar con email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'anypassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/credenciales inválidas/i);
    });

    test('debería fallar sin email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('debería fallar sin password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/auth/verify --------------------
  describe('GET /api/auth/verify', () => {
    let localToken;

    beforeAll(async () => {
      // Generar un token fresco específico para estos tests
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password_hash,
        });
      localToken = res.body.token;
    });

    test('debería verificar un token válido', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${localToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/token válido/i);
      expect(res.body.user).toBeDefined();
    });

    test('debería fallar sin token', async () => {
      const res = await request(app)
        .get('/api/auth/verify');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });

    test('debería fallar con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/token/i);
    });

    test('debería fallar con token malformado', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer malformedtoken');

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/token/i);
    });
  });

  // -------------------- POST /api/auth/logout --------------------
  describe('POST /api/auth/logout', () => {
    let logoutToken;

    beforeAll(async () => {
      // Crear un token temporal para el logout
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password_hash,
        });
      logoutToken = res.body.token;
    });

    test('debería cerrar sesión correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${logoutToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/cierre de sesión exitoso/i);
    });

    test('el token debería estar invalidado después del logout', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${logoutToken}`);

      expect(res.statusCode).toBe(401);
    });

    test('debería fallar sin token', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token/i);
    });
  });

  // -------------------- POST /api/auth/forgot-password --------------------
  describe('POST /api/auth/forgot-password', () => {
    test('debería procesar solicitud de recuperación para email existente', async () => {
      // Asegurarse de que testUserId está definido
      if (!testUserId) {
        const userResult = await pool.query(
          'SELECT id_usuario FROM usuario WHERE email = $1',
          [testUser.email]
        );
        testUserId = userResult.rows[0]?.id_usuario;
      }

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/enlace de restablecimiento/i);

      // Verificar que se creó el token en la DB
      const tokenResult = await pool.query(
        'SELECT token FROM password_reset WHERE id_usuario = $1 AND used = false ORDER BY created_at DESC LIMIT 1',
        [testUserId]
      );
      
      expect(tokenResult.rows.length).toBeGreaterThan(0);
      resetToken = tokenResult.rows[0].token;
    });

    test('debería responder igual para email inexistente (seguridad)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/enlace de restablecimiento/i);
    });

    test('debería fallar sin email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/auth/reset-password --------------------
  describe('POST /api/auth/reset-password', () => {
    test('debería resetear contraseña con token válido', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/contraseña actualizada/i);

      // Verificar que se puede hacer login con la nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'newpassword123',
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
      
      // Actualizar la contraseña en testUser para tests posteriores
      testUser.password_hash = 'newpassword123';
    });

    test('debería fallar al reutilizar token usado', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'anotherpassword',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/ya ha sido utilizado/i);
    });

    test('debería fallar con token inválido', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalidtoken123',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token.*no es válido/i);
    });

    test('debería fallar con token expirado', async () => {
      // Asegurarse de que testUserId está definido
      if (!testUserId) {
        const userResult = await pool.query(
          'SELECT id_usuario FROM usuario WHERE email = $1',
          [testUser.email]
        );
        testUserId = userResult.rows[0]?.id_usuario;
      }

      // Verificar que tenemos un testUserId válido
      expect(testUserId).toBeDefined();

      // Crear un token expirado manualmente
      const expiredToken = crypto.randomBytes(32).toString('hex');
      const expiredAt = new Date(Date.now() - 1000); // Expirado hace 1 segundo
      
      await pool.query(
        'INSERT INTO password_reset (id_usuario, token, expires_at, used) VALUES ($1, $2, $3, $4)',
        [testUserId, expiredToken, expiredAt, false]
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/expirado/i);
    });

    test('debería fallar sin token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/token.*requeridos/i);
    });

    test('debería fallar sin nueva contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'sometoken',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/contraseña.*requeridos/i);
    });
  });
});