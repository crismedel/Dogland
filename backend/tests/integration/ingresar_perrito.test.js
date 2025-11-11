import request from 'supertest';
import app from '../../app.js'; // Importa tu app de Express
import pool from '../../db/db.js'; // Importa la pool de la BD para setup/teardown

describe('Endpoints del Formulario de Adopción (animal_form)', () => {

  let jwtToken; // Token de autenticación para pruebas
  let testUserId;
  let testRazaId;
  let testHealthStateId;
  let createdAnimalId; // Para limpiar el animal creado

  const testUser = {
    nombre_usuario: 'FormTestUser',
    apellido_paterno: 'Test',
    apellido_materno: 'User',
    id_sexo: 1,
    fecha_nacimiento: '1995-01-01',
    telefono: '912341234',
    email: 'formtest@test.com',
    password_hash: 'testpass123',
    id_ciudad: 200, // Asumiendo que la ciudad 200 existe
  };

  const newAnimalData = {
    nombre_animal: 'Perrito de Prueba',
    edad_animal: 12,
    size: 'Mediano',
    // id_raza y id_estado_salud se asignarán en beforeAll
    descripcion_adopcion: 'Una descripción de prueba para la adopción.',
    foto_url: 'http://example.com/foto.jpg',
    historial_medico: {
      diagnostico: 'Sano, solo chequeo inicial',
      tratamiento: 'Ninguno',
      fecha_examen: '2025-10-30',
    },
  };

  // --- Setup: Crear datos necesarios (usuario, raza, estado) ---
  beforeAll(async () => {
    // 1. Limpiar datos de pruebas anteriores
    await pool.query("DELETE FROM usuario WHERE email = $1", [testUser.email]);
    await pool.query("DELETE FROM raza WHERE nombre_raza = $1", ['Raza de Prueba']);
    await pool.query("DELETE FROM estado_salud WHERE estado_salud = $1", ['Estado de Prueba']);

    // 2. Crear un usuario de prueba para obtener un token
    const resRegister = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    testUserId = resRegister.body.id; 

    // 3. Iniciar sesión para obtener el token
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password_hash });
    jwtToken = resLogin.body.token; 

    // 4. Crear una raza de prueba
    const resRaza = await pool.query(
      "INSERT INTO raza (nombre_raza, id_especie) VALUES ($1, 1) RETURNING id_raza", 
      ['Raza de Prueba'] // Asumiendo id_especie 1 (Perro) existe
    );
    testRazaId = resRaza.rows[0].id_raza;

    // 5. Crear un estado de salud de prueba
    // (Ajustado: La tabla solo tiene 'estado_salud')
    const resHealth = await pool.query(
      "INSERT INTO estado_salud (estado_salud) VALUES ($1) RETURNING id_estado_salud",
      ['Estado de Prueba']
    );
    testHealthStateId = resHealth.rows[0].id_estado_salud;
  });

  // --- Teardown: Limpiar todos los datos creados ---
  afterAll(async () => {
    // Limpiar en orden inverso para evitar errores de foreign key
    if (createdAnimalId) {
      await pool.query("DELETE FROM foto WHERE id_animal = $1", [createdAnimalId]);
      await pool.query("DELETE FROM historial_medico WHERE id_animal = $1", [createdAnimalId]);
      await pool.query("DELETE FROM adopcion WHERE id_animal = $1", [createdAnimalId]);
      await pool.query("DELETE FROM animal WHERE id_animal = $1", [createdAnimalId]);
    }
    await pool.query("DELETE FROM raza WHERE id_raza = $1", [testRazaId]);
    await pool.query("DELETE FROM estado_salud WHERE id_estado_salud = $1", [testHealthStateId]);
    await pool.query('DELETE FROM password_reset WHERE id_usuario = $1', [testUserId]);
    await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [testUserId]);
  });


  // --- Pruebas para GET /api/razas (de races_form.js) ---
  describe('GET /api/razas', () => {
    test('debería obtener la lista de razas', async () => {
      const res = await request(app)
        .get('/api/razas')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(r => r.id_raza === testRazaId)).toBe(true);
    });
  });

  // --- Pruebas para GET /api/health-states (de healthStates_form.js) ---
  describe('GET /api/health-states', () => {
    test('debería obtener la lista de estados de salud', async () => {
      const res = await request(app)
        .get('/api/health-states')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some(h => h.id_estado_salud === testHealthStateId)).toBe(true);
    });
  });

  // --- Pruebas para POST /api/full-animal (de animal_form.js) ---
  describe('POST /api/full-animal', () => {
    
    test('debería fallar al crear un animal sin token de autenticación', async () => {
      const res = await request(app)
        .post('/api/full-animal')
        .send(newAnimalData);

      expect(res.statusCode).toBe(401); 
      expect(res.body.success).toBe(false);
    });

    test('debería fallar si faltan campos obligatorios (ej. nombre_animal)', async () => {
      const res = await request(app)
        .post('/api/full-animal')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ ...newAnimalData, nombre_animal: undefined });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    test('debería crear un perfil de animal completo correctamente', async () => {
      const res = await request(app)
        .post('/api/full-animal')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...newAnimalData,
          id_raza: testRazaId,
          id_estado_salud: testHealthStateId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/creado exitosamente/i);
      expect(res.body.data.id_animal).toBeDefined();

      createdAnimalId = res.body.data.id_animal; // Guardamos para el teardown
    });

    test('debería haber guardado los datos en todas las tablas (animal, adopcion, historial, foto)', async () => {
      // 1. Verificar animal
      const animalRes = await pool.query("SELECT * FROM animal WHERE id_animal = $1", [createdAnimalId]);
      expect(animalRes.rowCount).toBe(1);
      expect(animalRes.rows[0].nombre_animal).toBe('Perrito de Prueba');

      // 2. Verificar adopcion
      const adopcionRes = await pool.query("SELECT * FROM adopcion WHERE id_animal = $1", [createdAnimalId]);
      expect(adopcionRes.rowCount).toBe(1);
      expect(adopcionRes.rows[0].descripcion).toBe('Una descripción de prueba para la adopción.');

      // 3. Verificar historial_medico
      const historialRes = await pool.query("SELECT * FROM historial_medico WHERE id_animal = $1", [createdAnimalId]);
      expect(historialRes.rowCount).toBe(1);
      expect(historialRes.rows[0].diagnostico).toBe('Sano, solo chequeo inicial');

      // 4. Verificar foto
      const fotoRes = await pool.query("SELECT * FROM foto WHERE id_animal = $1", [createdAnimalId]);
      expect(fotoRes.rowCount).toBe(1);
      expect(fotoRes.rows[0].url).toBe('http://example.com/foto.jpg');
    });

    test('debería fallar si el id_raza no existe (prueba de transacción)', async () => {
      const res = await request(app)
        .post('/api/full-animal')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          ...newAnimalData,
          id_raza: 999999, // ID Inexistente
          id_estado_salud: testHealthStateId,
          nombre_animal: 'Animal Transaccion Fallida'
        });

      expect(res.statusCode).toBe(500); 
      expect(res.body.success).toBe(false);

      // Verificar que el animal NO se creó (Rollback)
      const animalRes = await pool.query("SELECT * FROM animal WHERE nombre_animal = $1", ['Animal Transaccion Fallida']);
      expect(animalRes.rowCount).toBe(0);
    });

  });
});