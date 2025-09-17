import express from 'express';
const app = express();

import pool from './db/db.js';

import alertsRouter from './routes/alerts.js';
import authRouter from './routes/auth.js';
import organizationsRouter from './routes/organizations.js';
import usersRouter from './routes/users.js';
import passwordResetRequestRouter from './routes/password-reset-request.js';
import passwordResetConfirmRouter from './routes/password-reset-confirm.js';

// conffiguraciones
app.set('port', 3000);
app.use(express.json());

// rutas
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use('/api', alertsRouter);
app.use('/api/auth', authRouter);
app.use('/api', organizationsRouter);
app.use('/api', usersRouter);
app.use("/api", passwordResetRequestRouter);
app.use("/api", passwordResetConfirmRouter);

app.listen(app.get('port'), () => {
  console.log(`Servidor correindo en http://localhost:${app.get('port')}`);
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Conexión exitosa:", result.rows[0]);
  } catch (error) {
    console.error("Error de conexión:", error.message);    
  } finally {
    await pool.end();
  }
})();