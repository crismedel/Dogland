import express from 'express';
import cors from 'cors';
import pool from './db/db.js';
import { NODE_ENV, PORT } from './config/env.js';

// middlewares
import { corsOptions, corsBlocker } from './middlewares/corsConfig.js';
import { errorHandler } from './middlewares/errorHandler.js';

// routes
import sightingsRouter from './routes/sightings.js';
import alertsRouter from './routes/alerts.js';
import authRouter from './routes/auth.js';
import organizationsRouter from './routes/organizations.js';
import usersRouter from './routes/users.js';
import animalsRouter from './routes/animals.js';
import adoptionsRouter from './routes/adoptions.js';
import regionsRouter from './routes/regions.js';
import citiesRouter from './routes/cities.js';

const app = express();

// Configuraciones base
app.set('port', PORT);
app.use(express.json());

// Middleware CORS
app.use(cors(corsOptions));
app.use(corsBlocker);

// Rutas principales
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use('/api/auth', authRouter);
app.use('/api', sightingsRouter);
app.use('/api', alertsRouter);
app.use('/api', organizationsRouter);
app.use('/api', usersRouter);
app.use('/api', regionsRouter);
app.use('/api', citiesRouter);
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

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    if (NODE_ENV === 'development') {
      console.log('Conexión exitosa:', result.rows[0]);
    }
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
  // } finally {
  //   await pool.end();
  // }
})();

export default app;
