import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';

describe('Auth Module Integration Tests', () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    // Teardown database state
    await prisma.ledgerEntry.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.walletBalance.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.ledgerEntry.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.walletBalance.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
    await redis.quit();
  });

  it('should register a new user, wallet and 0 balances on POST /auth/register', async () => {
    const response = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');

    // Verify database side-effects
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        wallet: {
          include: {
            balances: true,
          },
        },
      },
    });

    expect(user).toBeTruthy();
    expect(user?.wallet).toBeTruthy();
    expect(user?.wallet?.balances).toHaveLength(3); // BRL, BTC, ETH

    const brlBalance = user?.wallet?.balances.find((b) => b.token === 'BRL');
    expect(Number(brlBalance?.amount)).toBe(0);
  });

  it('should return 409 Conflict when registering an existing email', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const response = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'anotherpassword',
      })
      .expect(409);

    expect(response.body.error).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('should login successfully with correct credentials', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'login@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const response = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'login@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');

    // Verify stored refresh token hash in DB
    const user = await prisma.user.findUnique({
      where: { email: 'login@example.com' },
    });
    expect(user?.refreshToken).toBeTruthy();
  });

  it('should return 401 Unauthorized for incorrect password or user not found', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'wrongpass@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    // Incorrect password
    let response = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'wrongpass@example.com',
        password: 'incorrectpassword',
      })
      .expect(401);

    expect(response.body.error).toBe('INVALID_CREDENTIALS');

    // Non-existent user
    response = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'securepassword123',
      })
      .expect(401);

    expect(response.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('should refresh session and rotate refresh token on POST /auth/refresh', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'refresh@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'refresh@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const firstRefreshToken = loginRes.body.refreshToken;

    // Wait slightly or perform refresh immediately
    const refreshRes = await request(app.server)
      .post('/auth/refresh')
      .send({ refreshToken: firstRefreshToken })
      .expect(200);

    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
    expect(refreshRes.body.refreshToken).not.toBe(firstRefreshToken);

    // Verify DB contains the new hash
    const user = await prisma.user.findUnique({
      where: { email: 'refresh@example.com' },
    });
    expect(user?.refreshToken).toBeTruthy();
  });

  it('should revoke all tokens and block session if refresh token is reused', async () => {
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'stolen@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'stolen@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const originalToken = loginRes.body.refreshToken;

    // First refresh: works fine and rotates
    await request(app.server)
      .post('/auth/refresh')
      .send({ refreshToken: originalToken })
      .expect(200);

    // Second refresh with SAME original token (theft/reuse attempt)
    const refreshRes2 = await request(app.server)
      .post('/auth/refresh')
      .send({ refreshToken: originalToken })
      .expect(401);

    expect(refreshRes2.body.error).toBe('INVALID_REFRESH_TOKEN');

    // Verify that all sessions are revoked (DB refreshToken is set to null)
    const user = await prisma.user.findUnique({
      where: { email: 'stolen@example.com' },
    });
    expect(user?.refreshToken).toBeNull();
  });
});
