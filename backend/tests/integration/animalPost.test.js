import request from 'supertest';
import app from '../../app.js';
import pool from '../../db/db.js';

describe('Endpoints de Creación de Animales (POST)', () => { // <-- BLOQUE EXTERNO (abre)

  let jwtUser;
  let userId;
  const testEmail = 'user_animal_post@test.com';
  const testPhone = '912345677'; // Teléfono único
  
  const createdAnimalIds = [];

  const login = async (email) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: '123456' });
    return res.body.token;
  };

  beforeAll(async () => {
    await pool.query("DELETE FROM dogland.usuario WHERE email = $1", [testEmail]);

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombre_usuario: 'User',
        apellido_paterno: 'AnimalPost',
        apellido_materno: 'Test',
        id_sexo: 1,
        fecha_nacimiento: '2000-01-01',
        telefono: testPhone,
        email: testEmail,
        password_hash: '123456',
        id_ciudad: 200, 
      });

    expect(registerRes.statusCode).toBe(201);
    jwtUser = await login(testEmail);
    expect(jwtUser).toBeDefined();

    const userRes = await pool.query(
      "SELECT id_usuario FROM dogland.usuario WHERE email = $1",
      [testEmail]
    );
    expect(userRes.rows.length).toBeGreaterThan(0);
    userId = userRes.rows[0].id_usuario;
  });

  afterAll(async () => {
    if (createdAnimalIds.length > 0) {
      await pool.query("DELETE FROM dogland.animal_foto WHERE id_animal = ANY($1::int[])", [createdAnimalIds]);
      await pool.query("DELETE FROM dogland.animal WHERE id_animal = ANY($1::int[])", [createdAnimalIds]);
    }
    if (userId) {
      await pool.query("DELETE FROM dogland.usuario WHERE id_usuario = $1", [userId]);
    }
  });

  // -------------------- POST /api/animalsPost --------------------
  describe('POST /api/animalsPost', () => { // <-- BLOQUE INTERNO (abre)

    test('debería crear un animal con fotos correctamente (201)', async () => {
      const newAnimal = {
        nombre_animal: 'Test Animal Fido',
        id_estado_salud: 1, 
        id_raza: 1, 
        edad_aproximada: 'Cachorro',
        fotos: [
          'https://example.com/foto1.jpg',
          'https://example.com/foto2.png'
        ]
      };
      const res = await request(app)
        .post('/api/animalsPost')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(newAnimal);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_animal).toBeDefined();
      const newId = res.body.data.id_animal;
      createdAnimalIds.push(newId); 
      const animalInDb = await pool.query("SELECT * FROM dogland.animal WHERE id_animal = $1", [newId]);
      expect(animalInDb.rows.length).toBe(1);
      const photosInDb = await pool.query("SELECT * FROM dogland.animal_foto WHERE id_animal = $1", [newId]);
      expect(photosInDb.rows.length).toBe(2);
    });

    test('debería crear un animal solo con campos requeridos (sin fotos, sin raza) (201)', async () => {
      const minimalAnimal = {
        nombre_animal: 'Test Animal Minimo',
        id_estado_salud: 2, 
      };
      const res = await request(app)
        .post('/api/animalsPost')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send(minimalAnimal);
      expect(res.statusCode).toBe(201);
      const newId = res.body.data.id_animal;
      createdAnimalIds.push(newId); 
      const animalInDb = await pool.query("SELECT * FROM dogland.animal WHERE id_animal = $1", [newId]);
      expect(animalInDb.rows[0].id_raza).toBeNull();
    });
    
    test('debería fallar si falta nombre_animal (400)', async () => {
      const res = await request(app)
        .post('/api/animalsPost')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ id_estado_salud: 1 });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].message).toBe('Invalid input: expected string, received undefined');
    });

    test('debería fallar si falta id_estado_salud (400)', async () => {
      const res = await request(app)
        .post('/api/animalsPost')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({ nombre_animal: 'Test Fallido' });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].message).toBe('Invalid input: expected number, received undefined');
    });

    test('debería fallar si fotos no es un array de URLs (400)', async () => {
      const res = await request(app)
        .post('/api/animalsPost')
        .set('Authorization', `Bearer ${jwtUser}`)
        .send({
          nombre_animal: 'Test URL Fallida',
          id_estado_salud: 1,
          fotos: ['esto-no-es-una-url']
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].message).toBe('Las fotos deben ser URLs válidas');
    });

    test('debería fallar si no se envía token de autenticación (401)', async () => {
      const res = await request(app)
        .post('/api/animalsPost')
        .send({
          nombre_animal: 'Test Sin Token',
          id_estado_salud: 1
        });
      
      // Estas son las líneas que faltaban en tu captura de pantalla
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('No se proporcionó token');    
    });

  }); // <-- BLOQUE INTERNO (cierra)

}); // <-- BLOQUE EXTERNO (cierra) - ¡ESTE ES EL QUE FALTABA!