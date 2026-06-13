import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import crypto from 'crypto';
import Decimal from 'decimal.js';

describe('Deposit Webhook Integration Tests', () => {
  const app = buildApp();
  const webhookSecret = 'test-webhook-secret';

  beforeAll(async () => {
    // Set environment variable for tests
    process.env.WEBHOOK_SECRET = webhookSecret;
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

  const generateSignature = (body: Record<string, unknown>, secret: string) => {
    const payload = JSON.stringify(body);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  };

  it('should process deposit webhook successfully (happy path)', async () => {
    // 1. Create a user and wallet to deposit to
    const regRes = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'deposit@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const userId = regRes.body.id;
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId },
      include: { balances: true },
    });

    const body = {
      walletId: wallet.id,
      token: 'BRL',
      amount: '150.75',
      idempotencyKey: 'idemp-key-happy-path',
    };

    const signature = generateSignature(body, webhookSecret);

    // 2. Post webhook to /webhooks/deposit
    const res = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(201);

    expect(res.body.transaction).toBeDefined();
    expect(res.body.transaction.type).toBe('DEPOSIT');
    expect(new Decimal(res.body.transaction.toAmount).equals(new Decimal('150.75'))).toBe(true);
    expect(res.body.transaction.idempotencyKey).toBe('idemp-key-happy-path');

    // 3. Verify balance was updated
    const updatedBalance = await prisma.walletBalance.findUniqueOrThrow({
      where: {
        walletId_token: {
          walletId: wallet.id,
          token: 'BRL',
        },
      },
    });
    expect(updatedBalance.amount.toString()).toBe('150.75');

    // 4. Verify ledger entries were created
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { walletBalanceId: updatedBalance.id },
    });
    expect(ledgerEntries.length).toBe(1);
    expect(ledgerEntries[0].type).toBe('DEPOSIT');
    expect(ledgerEntries[0].delta.toString()).toBe('150.75');
    expect(ledgerEntries[0].balanceBefore.toString()).toBe('0');
    expect(ledgerEntries[0].balanceAfter.toString()).toBe('150.75');
  });

  it('should return 401 Unauthorized if signature header is missing', async () => {
    const body = {
      walletId: 'some-wallet-id',
      token: 'BRL',
      amount: '100.00',
      idempotencyKey: 'idemp-key-missing-sig',
    };

    const res = await request(app.server)
      .post('/webhooks/deposit')
      .send(body)
      .expect(401);

    expect(res.body.error).toBe('INVALID_SIGNATURE');
  });

  it('should return 401 Unauthorized if signature is invalid', async () => {
    const body = {
      walletId: 'some-wallet-id',
      token: 'BRL',
      amount: '100.00',
      idempotencyKey: 'idemp-key-invalid-sig',
    };

    const res = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', 'wrong-signature-value')
      .send(body)
      .expect(401);

    expect(res.body.error).toBe('INVALID_SIGNATURE');
  });

  it('should return 400 Bad Request if token is not supported', async () => {
    const body = {
      walletId: 'some-wallet-id',
      token: 'USDT', // unsupported
      amount: '100.00',
      idempotencyKey: 'idemp-key-invalid-token',
    };

    const signature = generateSignature(body, webhookSecret);

    const res = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(400);

    expect(res.body.error).toBe('FST_ERR_VALIDATION');
  });

  it('should return 400 Bad Request if amount is not positive', async () => {
    const body = {
      walletId: 'some-wallet-id',
      token: 'BRL',
      amount: '-50.00', // negative
      idempotencyKey: 'idemp-key-negative-amount',
    };

    const signature = generateSignature(body, webhookSecret);

    const res = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(400);

    expect(res.body.error).toBe('FST_ERR_VALIDATION');
  });

  it('should return 404 Not Found if wallet does not exist', async () => {
    const body = {
      walletId: 'non-existent-wallet-id',
      token: 'BRL',
      amount: '100.00',
      idempotencyKey: 'idemp-key-missing-wallet',
    };

    const signature = generateSignature(body, webhookSecret);

    const res = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(404);

    expect(res.body.error).toBe('WALLET_NOT_FOUND');
  });

  it('should process duplicate webhook idempotently', async () => {
    // 1. Create a user and wallet to deposit to
    const regRes = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'deposit-idemp@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const userId = regRes.body.id;
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId },
      include: { balances: true },
    });

    const body = {
      walletId: wallet.id,
      token: 'BRL',
      amount: '200.00',
      idempotencyKey: 'idemp-key-duplicate-test',
    };

    const signature = generateSignature(body, webhookSecret);

    // First call (201 Created)
    const res1 = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(201);

    const firstTxId = res1.body.transaction.id;

    // Second call with same idempotency key (200 OK)
    const res2 = await request(app.server)
      .post('/webhooks/deposit')
      .set('X-Webhook-Signature', signature)
      .send(body)
      .expect(200);

    expect(res2.body.transaction.id).toBe(firstTxId);

    // Verify balance was only updated once (should be 200.00, not 400.00)
    const updatedBalance = await prisma.walletBalance.findUniqueOrThrow({
      where: {
        walletId_token: {
          walletId: wallet.id,
          token: 'BRL',
        },
      },
    });
    expect(updatedBalance.amount.toString()).toBe('200');

    // Verify only one ledger entry was created
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { walletBalanceId: updatedBalance.id },
    });
    expect(ledgerEntries.length).toBe(1);
  });
});
