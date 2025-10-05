import app from './app.js';
import { PORT, NODE_ENV } from './config/env.js';

if (NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
