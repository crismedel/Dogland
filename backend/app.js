import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { NODE_ENV, PORT, SESSION_SECRET } from './config/env.js';
import './config/passport.js'; // Importar configuración de Passport
import passport from 'passport';

// middlewares
import { corsOptions, corsBlocker } from './middlewares/corsConfig.js';
import { errorHandler } from './middlewares/errorHandler.js';

// routes
import sightingsRouter from './routes/sightings.js';
import alertsRouter from './routes/alerts.js';
import authRouter from './routes/auth.js';
import authGoogle from './routes/authGoogle.js'
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
import envioAnimalesRoutes from './routes/animal_form.js';
import racesFormRouter from './routes/races_form.js'; // archivo para razas pagina adoptar
import healthStatesFormRouter from './routes/healthStates_form.js'; // pagina adoptar


const app = express();

// Configuraciones base
app.set('port', PORT);
app.use(express.json());

// Middleware CORS
app.use(cors(corsOptions));
app.use(corsBlocker);

// Passport definicion e inicializacion
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rutas principales
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use('/api/stats', statRoutes); //estadisticas de avistamientos
app.use('/api/auth', authRouter);
app.use('/api/auth/google', authGoogle);
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

//---------------NO TOCAR----------------------------
app.use('/api', envioAnimalesRoutes);
app.use('/api', racesFormRouter); 
app.use('/api', healthStatesFormRouter); 
//-----------------------------------------------


// Middleware de manejo de errores general
app.use(errorHandler);

export default app;
