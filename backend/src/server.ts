import { createApp } from './app.js';
import { env } from './config/env.js';

const { app, database } = createApp();
const server = app.listen(env.PORT, () => {
  console.info(`API disponible en http://localhost:${env.PORT}/api`);
});

const shutdown = (): void => {
  server.close(() => {
    database.close();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
