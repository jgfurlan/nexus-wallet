import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';

describe('Wallet Module Integration Tests', () => {
  const app = buildApp();

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
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

  it('should return wallet balances for authenticated user', async () => {
    // 1. Register
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'wallet@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    // 2. Login to get token
    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'wallet@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const token = loginRes.body.accessToken;

    // 3. Query wallet balances
    const balancesRes = await request(app.server)
      .get('/wallet/balances')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(balancesRes.body).toHaveProperty('walletId');
    expect(balancesRes.body.balances).toHaveLength(3);

    const brl = balancesRes.body.balances.find((b: { token: string }) => b.token === 'BRL');
    const btc = balancesRes.body.balances.find((b: { token: string }) => b.token === 'BTC');
    const eth = balancesRes.body.balances.find((b: { token: string }) => b.token === 'ETH');

    expect(brl).toBeTruthy();
    expect(btc).toBeTruthy();
    expect(eth).toBeTruthy();

    expect(Number(brl.amount)).toBe(0);
    expect(Number(btc.amount)).toBe(0);
    expect(Number(eth.amount)).toBe(0);
  });

  it('should block query request if Authorization header is missing', async () => {
    await request(app.server)
      .get('/wallet/balances')
      .expect(401);
  });

  it('should block query request if JWT token is invalid', async () => {
    await request(app.server)
      .get('/wallet/balances')
      .set('Authorization', 'Bearer invalidtoken123')
      .expect(401);
  });

  it('should recreate wallet and balances on the fly if missing in database (resilience)', async () => {
    // 1. Register
    const regRes = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'resilient@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const userId = regRes.body.id;

    // 2. Login to get token
    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'resilient@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const token = loginRes.body.accessToken;

    // 3. Manually delete the user's wallet in DB to simulate corruption/inconsistency
    await prisma.walletBalance.deleteMany({});
    await prisma.wallet.deleteMany({});

    // 4. Query balances - should automatically recreate the wallet and succeed
    const balancesRes = await request(app.server)
      .get('/wallet/balances')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(balancesRes.body).toHaveProperty('walletId');
    expect(balancesRes.body.balances).toHaveLength(3);

    // 5. Verify database actually has the new wallet
    const dbWallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { balances: true },
    });

    expect(dbWallet).toBeTruthy();
    expect(dbWallet?.balances).toHaveLength(3);
  });
});
