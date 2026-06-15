import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import Decimal from 'decimal.js';

describe('Módulo de Histórico - Testes de Integração', () => {
  const app = buildApp();
  let authToken: string;
  let userId: string;

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

    const registerRes = await request(app.server)
      .post('/auth/register')
      .send({ email: 'history@example.com', password: 'password123' });
    
    userId = registerRes.body.id;

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'history@example.com', password: 'password123' });
    
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  it('deve retornar lista vazia se o usuário não tiver transações', async () => {
    const response = await request(app.server)
      .get('/wallet/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);
    expect(response.body.nextCursor).toBeNull();
  });

  it('deve listar transações com detalhes do ledger e paginação', async () => {
    // 1. Criar transações de teste (seed)
    // Depósito
    const tx1 = await prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        toToken: 'BRL',
        toAmount: new Decimal(100),
      }
    });

    // Saque
    const tx2 = await prisma.transaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        fromToken: 'BRL',
        fromAmount: new Decimal(50),
      }
    });

    // 2. Chamar histórico com limite de 1
    const res = await request(app.server)
      .get('/wallet/history?limit=1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(tx2.id); // Ordem decrescente
    expect(res.body.nextCursor).toBe(tx2.id);

    // 3. Buscar próxima página usando o cursor
    const res2 = await request(app.server)
      .get(`/wallet/history?limit=1&cursor=${res.body.nextCursor}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(res2.body.data).toHaveLength(1);
    expect(res2.body.data[0].id).toBe(tx1.id);
    expect(res2.body.nextCursor).toBeNull(); // Fim da lista
  });

  it('deve filtrar por token e tipo', async () => {
    // Criar um depósito de BRL e um de BTC
    await prisma.transaction.create({
      data: { userId, type: 'DEPOSIT', toToken: 'BRL', toAmount: new Decimal(100) }
    });
    await prisma.transaction.create({
      data: { userId, type: 'DEPOSIT', toToken: 'BTC', toAmount: new Decimal(0.1) }
    });

    // Filtro BRL
    const resBrl = await request(app.server)
      .get('/wallet/history?token=BRL')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(resBrl.body.data).toHaveLength(1);
    expect(resBrl.body.data[0].toToken).toBe('BRL');

    // Filtro BTC
    const resBtc = await request(app.server)
      .get('/wallet/history?token=BTC')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(resBtc.body.data).toHaveLength(1);
    expect(resBtc.body.data[0].toToken).toBe('BTC');
  });
});
