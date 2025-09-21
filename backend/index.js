import express from 'express';
import cors from 'cors';

import { corsOptions, corsBlocker } from './middlewares/corsConfig.js';

const app = express();

import alertsRouter from './routes/alerts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import organizationsRouter from './routes/organizations.js';
import usersRouter from './routes/users.js';
import passwordResetRequestRouter from './routes/password-reset-request.js';
import passwordResetConfirmRouter from './routes/password-reset-confirm.js';

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

app.use('/api', alertsRouter);
app.use('/api', organizationsRouter);
app.use('/api', usersRouter);
app.use('/api', passwordResetRequestRouter);
app.use('/api', passwordResetConfirmRouter);

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
