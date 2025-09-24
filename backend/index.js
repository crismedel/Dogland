import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import cors from 'cors';

import { corsOptions, corsBlocker } from './middlewares/corsConfig.js';

const app = express();

import pool from './db/db.js';
import sightingsRouter from './routes/sightings.js';
import alertsRouter from './routes/alerts.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import organizationsRouter from './routes/organizations.js';
import usersRouter from './routes/users.js';
import passwordResetRequestRouter from './routes/password-reset-request.js';
import passwordResetConfirmRouter from './routes/password-reset-confirm.js';
import animalsRouter from './routes/animals.js';
import adoptionsRouter from './routes/adoptions.js';

// configuraciones
app.set('port', 3001);
app.use(express.json());

// middleware cors con opciones importadas
app.use(cors(corsOptions));

// Middleware para bloquear orígenes no permitidos
app.use(corsBlocker);

// rutas
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use('/api/auth', authRouter);
app.use('/api', sightingsRouter);
app.use('/api', alertsRouter);
app.use('/api', organizationsRouter);
app.use('/api', usersRouter);
app.use('/api', passwordResetRequestRouter);
app.use('/api', passwordResetConfirmRouter);

// manejo de animales y su adoción
app.use('/api', animalsRouter);
app.use('/api', adoptionsRouter);

// Middleware de manejo de errores general
app.use((err, req, res, next) => {
  console.error('Error capturado:', err);
  if (err.message === 'CORS no permitido para este origen') {
    return res.status(403).json({ error: 'CORS: Origen no permitido' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.use(errorHandler);

app.listen(app.get('port'), () => {
  console.log(`Servidor corriendo en http://localhost:${app.get('port')}`);
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa:', result.rows[0]);
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
  // } finally {
  //   await pool.end();
  // }
})();

export default app; //exportar para usar en tests
