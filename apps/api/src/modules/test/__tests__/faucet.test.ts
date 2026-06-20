import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import Decimal from 'decimal.js';

describe('Test Faucet - Testes de Integração', () => {
  const app = buildApp();
  let authToken: string;
  let walletId: string;

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    await prisma.ledgerEntry.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.walletBalance.deleteMany({});
    await prisma.wallet.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();

    // Registrar e Logar para obter token
    await request(app.server)
      .post('/auth/register')
      .send({ email: 'faucet_test@example.com', password: 'password123' });

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'faucet_test@example.com', password: 'password123' });

    authToken = loginRes.body.accessToken;

    const user = await prisma.user.findUnique({
      where: { email: 'faucet_test@example.com' },
      include: { wallet: true },
    });
    walletId = user!.wallet!.id;
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  it('deve processar deposito com parametros padrao (1000 BRL) se o body estiver vazio', async () => {
    const response = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe('1000');
    expect(response.body.token).toBe('BRL');

    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'BRL' } }
    });
    expect(new Decimal(balance?.amount || 0).toString()).toBe('1000');
  });

  it('deve processar deposito de quantia customizada de BTC', async () => {
    const response = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '0.25',
        token: 'BTC'
      });

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe('0.25');
    expect(response.body.token).toBe('BTC');

    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'BTC' } }
    });
    expect(new Decimal(balance?.amount || 0).toString()).toBe('0.25');
  });

  it('deve processar deposito de quantia customizada de ETH', async () => {
    const response = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '10.5',
        token: 'ETH'
      });

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe('10.5');
    expect(response.body.token).toBe('ETH');

    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'ETH' } }
    });
    expect(new Decimal(balance?.amount || 0).toString()).toBe('10.5');
  });

  it('deve falhar se o amount for negativo ou zero', async () => {
    const responseNeg = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '-10',
        token: 'BRL'
      });
    expect(responseNeg.status).toBe(400);

    const responseZero = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '0',
        token: 'BRL'
      });
    expect(responseZero.status).toBe(400);
  });

  it('deve falhar se o token for invalido', async () => {
    const response = await request(app.server)
      .post('/test/faucet')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: '100',
        token: 'INVALID_TOKEN'
      });
    expect(response.status).toBe(400);
  });
});
