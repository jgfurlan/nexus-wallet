import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import Decimal from 'decimal.js';
import { randomUUID } from 'crypto';

describe('Módulo de Saque (Withdrawal) - Testes de Integração', () => {
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
      .send({ email: 'withdraw@example.com', password: 'password123' });

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({ email: 'withdraw@example.com', password: 'password123' });

    authToken = loginRes.body.accessToken;
    
    const user = await prisma.user.findUnique({
      where: { email: 'withdraw@example.com' },
      include: { wallet: true },
    });
    walletId = user!.wallet!.id;

    // Creditar saldo inicial para teste (1000 BRL) via update direto (bypass ledger para setup)
    await prisma.walletBalance.update({
      where: { walletId_token: { walletId, token: 'BRL' } },
      data: { amount: new Decimal(1000) }
    });
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  it('deve processar saque de BRL com chave PIX válida', async () => {
    const externalId = randomUUID();
    const response = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: 'BRL',
        amount: '100.50',
        address: 'joao@nexus.com.br', // Email PIX
        externalId,
      });

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('WITHDRAWAL');
    expect(new Decimal(response.body.fromAmount).toString()).toBe('100.5');

    // Verificar saldo final: 1000 - 100.50 = 899.50
    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'BRL' } }
    });
    expect(balance?.amount.toString()).toBe('899.5');

    // Verificar Ledger
    const entry = await prisma.ledgerEntry.findFirst({
      where: { walletBalanceId: balance?.id, type: 'WITHDRAWAL' }
    });
    expect(entry?.delta.toString()).toBe('-100.5');
  });

  it('deve processar saque de BTC com endereço válido', async () => {
    // Setup: Adicionar saldo BTC
    await prisma.walletBalance.update({
      where: { walletId_token: { walletId, token: 'BTC' } },
      data: { amount: new Decimal('1.0') }
    });

    const response = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: 'BTC',
        amount: '0.5',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Endereço Genesis
        externalId: randomUUID(),
      });

    expect(response.status).toBe(200);
    expect(new Decimal(response.body.fromAmount).toString()).toBe('0.5');

    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'BTC' } }
    });
    expect(balance?.amount.toString()).toBe('0.5');
  });

  it('deve rejeitar saque se o saldo for insuficiente', async () => {
    const response = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: 'BRL',
        amount: '5000.00', // Maior que os 1000 iniciais
        address: '12345678901', // CPF PIX
        externalId: randomUUID(),
      });

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('INSUFFICIENT_BALANCE');
  });

  it('deve garantir idempotência (mesmo externalId não debita duas vezes)', async () => {
    const externalId = randomUUID();
    const payload = {
      token: 'BRL',
      amount: '50.00',
      address: 'joao@nexus.com.br',
      externalId,
    };

    // Primeiro envio
    const res1 = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    
    expect(res1.status).toBe(200);

    // Segundo envio (mesmo ID)
    const res2 = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);
    
    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(res1.body.id);

    // Saldo deve ter diminuído apenas uma vez: 1000 - 50 = 950
    const balance = await prisma.walletBalance.findUnique({
      where: { walletId_token: { walletId, token: 'BRL' } }
    });
    expect(balance?.amount.toString()).toBe('950');
  });

  it('deve rejeitar chave PIX ou endereço cripto mal formatado', async () => {
    // PIX inválido
    const resBrl = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: 'BRL',
        amount: '10.00',
        address: 'abc', // Muito curto/inválido para PIX
        externalId: randomUUID(),
      });
    expect(resBrl.status).toBe(400);

    // BTC endereço inválido
    const resBtc = await request(app.server)
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        token: 'BTC',
        amount: '0.001',
        address: 'invalid-btc-addr',
        externalId: randomUUID(),
      });
    expect(resBtc.status).toBe(400);
  });
});
