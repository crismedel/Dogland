import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Animales con validaciones Zod', () => {

  let jwtAdmin;
  let createdAnimalId;

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    await pool.query("DELETE FROM usuario WHERE email = 'admin_animal@test.com'");

    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Admin',
        apellido_paterno: 'Animal',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345680',
        email: 'admin_animal@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });
    await pool.query("UPDATE usuario SET id_rol = 1 WHERE email = 'admin_animal@test.com'");

    jwtAdmin = await login('admin_animal@test.com');
  });

  afterAll(async () => {
    if (createdAnimalId) {
      await pool.query("DELETE FROM animal WHERE id_animal = $1", [createdAnimalId]);
    }
    await pool.query("DELETE FROM usuario WHERE email = 'admin_animal@test.com'");
  });

  // -------------------- GET /api/animals --------------------
  describe('GET /api/animals', () => {
    test('debería listar animales sin parámetros', async () => {
      const res = await request(app).get('/api/animals');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('debería validar limit como número', async () => {
      const res = await request(app).get('/api/animals?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app).get('/api/animals?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería aplicar filtros con id_estado_salud', async () => {
      const res = await request(app).get('/api/animals?id_estado_salud=1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('debería validar que id_estado_salud sea número', async () => {
      const res = await request(app).get('/api/animals?id_estado_salud=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/animals/:id --------------------
  describe('GET /api/animals/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app).get('/api/animals/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/animals/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/animals --------------------
  describe('POST /api/animals', () => {
    const validAnimal = {
      nombre_animal: 'Rex Test',
      edad_animal: 3,
      edad_aproximada: 'adulto',
      id_estado_salud: 1,
      id_raza: 1
    };

    test('debería validar que nombre_animal sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, nombre_animal: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que nombre_animal no exceda 100 caracteres', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, nombre_animal: 'a'.repeat(101) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que edad_animal sea un número', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, edad_animal: 'abc' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que edad_animal no sea negativa', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, edad_animal: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que edad_animal no exceda 50', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, edad_animal: 51 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que edad_aproximada sea string si se proporciona', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, edad_aproximada: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_estado_salud sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, id_estado_salud: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que id_raza sea obligatorio', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validAnimal, id_raza: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería crear animal correctamente con datos válidos', async () => {
      const res = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(validAnimal);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre_animal).toBe('Rex Test');

      createdAnimalId = res.body.data.id_animal;
    });
  });

  // -------------------- PUT /api/animals/:id --------------------
  describe('PUT /api/animals/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .put('/api/animals/abc')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ nombre_animal: 'Updated Name' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que al menos un campo esté presente', async () => {
      const res = await request(app)
        .put(`/api/animals/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos un campo/i);
    });

    test('debería validar nombre_animal si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/animals/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ nombre_animal: 'a'.repeat(101) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar edad_animal si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/animals/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ edad_animal: -5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar animal correctamente', async () => {
      const res = await request(app)
        .put(`/api/animals/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({
          nombre_animal: 'Rex Updated',
          edad_animal: 4
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre_animal).toBe('Rex Updated');
    });

    test('debería retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/animals/999999')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ nombre_animal: 'Test' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /api/animals/:id --------------------
  describe('DELETE /api/animals/:id', () => {
    test('debería validar que el ID sea numérico', async () => {
      const res = await request(app)
        .delete('/api/animals/abc')
        .set('Authorization', `Bearer ${jwtAdmin}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
