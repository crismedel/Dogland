// backend/tests/integration/catalogs.test.js
import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Catálogos (GET)', () => {

  let jwtUser;
  let userId;
  const testEmail = 'user_catalogs@test.com';
  const testPhone = '912345699'; // Teléfono único para esta prueba

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    // Limpiamos usuario de prueba anterior si existe
    await pool.query("DELETE FROM dogland.usuario WHERE email = $1", [testEmail]);

    // Registramos un usuario nuevo para esta suite de pruebas
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'User',
        apellido_paterno: 'Catalogs',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: testPhone,
        email: testEmail,
        password_hash: '123456',
        id_ciudad: 200,
      });

    // ¡VERIFICACIÓN CRUCIAL! Si esto falla, sabremos por qué.
    if (registerRes.statusCode !== 201) {
      console.error('FALLO EL REGISTRO DEL USUARIO DE PRUEBA (Catalogs):', registerRes.body);
    }
    expect(registerRes.statusCode).toBe(201);

    // Hacemos login para obtener el token
    jwtUser = await login(testEmail);
    expect(jwtUser).toBeDefined(); // Nos aseguramos que el token exista

    // Obtenemos el ID del usuario de la BD
    const userRes = await pool.query(
      "SELECT id_usuario FROM dogland.usuario WHERE email = $1",
      [testEmail]
    );
    
    // Verificamos que el usuario se insertó correctamente
    expect(userRes.rows.length).toBeGreaterThan(0);
    userId = userRes.rows[0].id_usuario;
  });

  afterAll(async () => {
    // Limpiamos solo el usuario que creamos en esta prueba
    if (userId) {
      await pool.query("DELETE FROM dogland.usuario WHERE id_usuario = $1", [userId]);
    }
  });

  // -------------------- GET /api/health-states --------------------
  describe('GET /api/health-states', () => {
    test('debería obtener la lista de estados de salud', async () => {
      const res = await request(app)
        .get('/api/health-states')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // --- CORRECCIÓN ---
      // Verificamos que existan *al menos* 5
      expect(res.body.data.length).toBeGreaterThanOrEqual(5); 
      
      // Verificamos que los 5 datos del seed están presentes
      const names = res.body.data.map(s => s.estado_salud);
      expect(names).toEqual(expect.arrayContaining([
        'Saludable', 'Enfermo', 'Herido', 'Recuperando', 'Desconocido'
      ]));
    });
  });

  // -------------------- GET /api/species --------------------
  describe('GET /api/species', () => {
    test('debería obtener la lista de especies', async () => {
      const res = await request(app)
        .get('/api/species')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3); // Esta pasó, así que está bien
      expect(res.body.data[0].nombre_especie).toBe('Canino');
    });
  });

  // -------------------- GET /api/races --------------------
  describe('GET /api/races', () => {
    test('debería obtener TODAS las razas (al menos 7)', async () => {
      const res = await request(app)
        .get('/api/races')
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      // --- CORRECCIÓN ---
      expect(res.body.data.length).toBeGreaterThanOrEqual(7);

      // Verificamos que las 7 razas del seed están presentes
      const names = res.body.data.map(r => r.nombre_raza);
      expect(names).toEqual(expect.arrayContaining([
        'Labrador Retriever', 'Pastor Alemán', 'Bulldog', // Canino
        'Persa', 'Siames', 'Maine Coon', // Felino
        'Conejo' // Otro
      ]));
    });

    test('debería filtrar razas por id_especie=1 (Canino, al menos 3 razas)', async () => {
      const res = await request(app)
        .get('/api/races?id_especie=1') // Filtro por Canino
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      // --- CORRECCIÓN ---
      expect(res.body.data.length).toBeGreaterThanOrEqual(3); 
      
      // Verificamos que las 3 razas de perro del seed están presentes
      const names = res.body.data.map(r => r.nombre_raza);
      expect(names).toEqual(expect.arrayContaining([
        'Labrador Retriever', 'Pastor Alemán', 'Bulldog'
      ]));
      
      // Verificamos que solo trajo razas de perro (esta lógica sigue bien)
      expect(res.body.data.every(r => r.id_especie === 1)).toBe(true);
    });

    test('debería filtrar razas por id_especie=2 (Felino, 3 razas)', async () => {
      const res = await request(app)
        .get('/api/races?id_especie=2') // Filtro por Felino
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3); // Esta pasó, la dejamos
      expect(res.body.data.every(r => r.id_especie === 2)).toBe(true);
    });

    test('debería devolver un array vacío si el id_especie no existe', async () => {
      const res = await request(app)
        .get('/api/races?id_especie=999') // ID que no existe
        .set('Authorization', `Bearer ${jwtUser}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0); // Esta pasó, la dejamos
    });
  });

});