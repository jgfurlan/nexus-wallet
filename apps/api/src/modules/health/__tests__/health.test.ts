import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';

describe('Health Routes', () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  it('should return 200 and status ok on GET /health', async () => {
    const response = await request(app.server)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return 404 for invalid route', async () => {
    const response = await request(app.server)
      .get('/invalid-route')
      .expect(404);

    expect(response.body).toEqual({
      error: 'NOT_FOUND',
      message: 'Route not found',
    });
  });
});
