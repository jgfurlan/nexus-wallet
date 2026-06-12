import { buildApp } from './app';
import { redis } from './lib/redis';

const app = buildApp();
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Attempt Redis connection
    await redis.connect().catch((err) => {
      app.log.warn(`Redis connection failed on startup: ${err.message}. Will retry lazily.`);
    });

    await app.listen({ port, host });
    app.log.info(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
