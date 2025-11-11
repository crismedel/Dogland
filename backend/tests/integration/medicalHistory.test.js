import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Historial Médico con validaciones Zod', () => {

  let jwtAdmin;
  let createdAnimalId, createdHistoryId;

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    await pool.query("DELETE FROM usuario WHERE email = 'admin_medical@test.com'");

    await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'Admin',
        apellido_paterno: 'Medical',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: '912345681',
        email: 'admin_medical@test.com',
        password_hash: '123456',
        id_ciudad: 200,
      });
    await pool.query("UPDATE usuario SET id_rol = 1 WHERE email = 'admin_medical@test.com'");

    jwtAdmin = await login('admin_medical@test.com');

    // Crear animal para pruebas
    const animalRes = await pool.query(
      `INSERT INTO animal (nombre_animal, edad_animal, id_estado_salud, id_raza)
       VALUES ($1, $2, $3, $4) RETURNING id_animal`,
      ['Bobby Medical', 4, 1, 1]
    );
    createdAnimalId = animalRes.rows[0].id_animal;
  });

  afterAll(async () => {
    if (createdHistoryId) {
      await pool.query("DELETE FROM historial_medico WHERE id_historial_medico = $1", [createdHistoryId]);
    }
    if (createdAnimalId) {
      await pool.query("DELETE FROM animal WHERE id_animal = $1", [createdAnimalId]);
    }
    await pool.query("DELETE FROM usuario WHERE email = 'admin_medical@test.com'");
  });

  // -------------------- GET /api/medicalHistory --------------------
  describe('GET /api/medicalHistory', () => {
    test('debería listar historial médico sin parámetros', async () => {
      const res = await request(app).get('/api/medicalHistory');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('debería validar limit como número', async () => {
      const res = await request(app).get('/api/medicalHistory?limit=abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que limit esté entre 1 y 100', async () => {
      const res = await request(app).get('/api/medicalHistory?limit=150');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- GET /api/medicalHistory/:animalId --------------------
  describe('GET /api/medicalHistory/:animalId', () => {
    test('debería validar que animalId sea numérico', async () => {
      const res = await request(app).get('/api/medicalHistory/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería retornar 404 para animal inexistente', async () => {
      const res = await request(app).get('/api/medicalHistory/999999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- POST /api/medicalHistory/:animalId --------------------
  describe('POST /api/medicalHistory/:animalId', () => {
    const validHistory = {
      fecha_evento: '2024-01-15',
      tipo_evento: 'Consulta',
      diagnostico: 'Revisión general',
      detalles: 'Animal en buen estado',
      nombre_veterinario: 'Dr. Test'
    };

    test('debería validar que animalId sea numérico', async () => {
      const res = await request(app)
        .post('/api/medicalHistory/abc')
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(validHistory);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que fecha_evento sea obligatoria', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, fecha_evento: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar formato de fecha_evento', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, fecha_evento: 'invalid-date' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que tipo_evento sea obligatorio', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, tipo_evento: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que tipo_evento no exceda 100 caracteres', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, tipo_evento: 'a'.repeat(101) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que diagnostico no exceda 500 caracteres', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, diagnostico: 'a'.repeat(501) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que detalles no exceda 1000 caracteres', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ ...validHistory, detalles: 'a'.repeat(1001) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería crear historial médico correctamente', async () => {
      const res = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(validHistory);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tipo_evento).toBe('Consulta');

      createdHistoryId = res.body.data.id_historial_medico;
    });
  });

  // -------------------- PUT /api/medicalHistory/:animalId/:historyId --------------------
  describe('PUT /api/medicalHistory/:animalId/:historyId', () => {
    test('debería validar que animalId sea numérico', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/abc/${createdHistoryId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ tipo_evento: 'Updated' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que historyId sea numérico', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/abc`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ tipo_evento: 'Updated' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que al menos un campo esté presente', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/${createdHistoryId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toMatch(/al menos un campo/i);
    });

    test('debería validar formato de fecha si se proporciona', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/${createdHistoryId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ fecha_evento: 'invalid-date' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar longitud de campos si se proporcionan', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/${createdHistoryId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ diagnostico: 'a'.repeat(501) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería actualizar historial médico correctamente', async () => {
      // Crear los datos que el test necesita
      // 1.Crear un registro de historial solo para este test
      const historyToCreate = {
        fecha_evento: '2024-01-20',
        tipo_evento: 'Chequeo Temporal',
        diagnostico: 'Para actualizar',
      };
      
      const createRes = await request(app)
        .post(`/api/medicalHistory/${createdAnimalId}`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(historyToCreate);
      
      // 2. Obtener el ID del registro creado
      const historyIdToUpdate = createRes.body.data.id_historial_medico;
      // --- FIN: Creación de datos ---
    
      // 3. Actualizar el registro especifico
      const updateData = {
        tipo_evento: 'Vacunación',
        diagnostico: 'Vacuna anual aplicada'
      };
    
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/${historyIdToUpdate}`) // <-- Usa el ID local
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send(updateData);
    
      // Verificar
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tipo_evento).toBe('Vacunación');
      
      // Limpiar
      await pool.query("DELETE FROM historial_medico WHERE id_historial_medico = $1", [historyIdToUpdate]);
    });

    test('debería retornar 404 para historial inexistente', async () => {
      const res = await request(app)
        .put(`/api/medicalHistory/${createdAnimalId}/999999`)
        .set('Authorization', `Bearer ${jwtAdmin}`)
        .send({ tipo_evento: 'Test' });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // -------------------- DELETE /api/medicalHistory/:animalId/:historyId --------------------
  describe('DELETE /api/medicalHistory/:animalId/:historyId', () => {
    test('debería validar que animalId sea numérico', async () => {
      const res = await request(app)
        .delete('/api/medicalHistory/abc/1')
        .set('Authorization', `Bearer ${jwtAdmin}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('debería validar que historyId sea numérico', async () => {
      const res = await request(app)
        .delete(`/api/medicalHistory/${createdAnimalId}/abc`)
        .set('Authorization', `Bearer ${jwtAdmin}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
