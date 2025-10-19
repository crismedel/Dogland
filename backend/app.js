import express from 'express';
import cors from 'cors';
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
import speciesRouter from './routes/species.js';
import racesRouter from './routes/races.js';
import healthRouter from './routes/health-states.js';
import medicalHistoryRouter from './routes/medicalHistory.js';
import statRoutes from './routes/stats.js';
import infoCompAnimales from './routes/infoCompAnimales.js'; //info de animales completa (en teoria)
import notificationsRoutes from './routes/notifications.js';

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

app.use('/api/stats', statRoutes); //estadisticas de avistamientos
app.use('/api/auth', authRouter);
app.use('/api', sightingsRouter);
app.use('/api', alertsRouter);
app.use('/api', organizationsRouter);
app.use('/api', usersRouter);
app.use('/api', regionsRouter);
app.use('/api', citiesRouter);
app.use('/api', animalsRouter);
app.use('/api', adoptionsRouter);
app.use('/api', speciesRouter);
app.use('/api', racesRouter);
app.use('/api', healthRouter);
app.use('/api', medicalHistoryRouter);
app.use('/api', infoCompAnimales);
app.use('/api/notifications', notificationsRoutes);

// Middleware de manejo de errores general
app.use(errorHandler);

export default app;
