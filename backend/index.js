import app from './app.js';
import pool from './db/db.js';
import { PORT, NODE_ENV } from './config/env.js';

if (NODE_ENV !== 'test') {
  (async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Conexión exitosa:', result.rows[0]);

      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Error de conexión:', error.message);
      process.exit(1);
    }
  })();
}
