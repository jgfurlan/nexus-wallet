import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import { CoinGeckoClient } from '../../../lib/coingecko';
import Decimal from 'decimal.js';

describe('Swap Module Integration Tests', () => {
  const app = buildApp();
  let authToken: string;
  let userId: string;
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

    // Create a test user
    const registerRes = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'swap@example.com',
        password: 'password123',
      });
    
    userId = registerRes.body.id;

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'swap@example.com',
        password: 'password123',
      });
    
    authToken = loginRes.body.accessToken;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    walletId = user!.wallet!.id;
  });

  afterAll(async () => {
    await app.close();
    await redis.quit();
  });

  it('should return a valid quote on GET /swap/quote', async () => {
    // Mock CoinGecko rate: 1 BTC = 300,000 BRL
    vi.spyOn(CoinGeckoClient, 'getExchangeRate').mockResolvedValue(new Decimal('0.000003333333333333'));

    const response = await request(app.server)
      .get('/swap/quote?fromToken=BRL&toToken=BTC&amount=1000')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.fromToken).toBe('BRL');
    expect(response.body.toToken).toBe('BTC');
    expect(response.body.sourceAmount).toBe('1000');
    // Fee = 1000 * 1.5% = 15
    expect(response.body.feeAmount).toBe('15');
    // Net = 985
    expect(response.body.netAmount).toBe('985');
    // Destination = 985 * 0.000003333333333333 = 0.003283333333333005
    expect(new Decimal(response.body.destinationAmount).toFixed(8)).toBe('0.00328333');
    expect(response.body.rate).toBe('0.000003333333333333');
    expect(response.body).toHaveProperty('expiresAt');

    // Verify saved in Redis
    const cached = await redis.get(`swap:quote:${response.body.id}`);
    expect(cached).toBeTruthy();
  });

  it('should execute a swap successfully', async () => {
    // 1. Give some BRL balance to the user
    await prisma.walletBalance.update({
      where: { walletId_token: { walletId, token: 'BRL' } },
      data: { amount: new Decimal(2000) }
    });

    // 2. Get a quote
    vi.spyOn(CoinGeckoClient, 'getExchangeRate').mockResolvedValue(new Decimal('0.000003333333333333'));
    const quoteRes = await request(app.server)
      .get('/swap/quote?fromToken=BRL&toToken=BTC&amount=1000')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    const quoteId = quoteRes.body.id;

    // 3. Execute swap
    const executeRes = await request(app.server)
      .post('/swap/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quoteId })
      .expect(200);

    expect(executeRes.body.type).toBe('SWAP');
    expect(executeRes.body.fromAmount).toBe('1000');
    expect(executeRes.body.toAmount).toBe(quoteRes.body.destinationAmount);

    // 4. Verify balances
    const balances = await prisma.walletBalance.findMany({
      where: { walletId },
    });

    const brl = balances.find(b => b.token === 'BRL')!;
    const btc = balances.find(b => b.token === 'BTC')!;

    // BRL: 2000 - 1000 = 1000
    expect(brl.amount.toString()).toBe('1000');
    // BTC: 0 + destinationAmount
    expect(btc.amount.toString()).toBe(quoteRes.body.destinationAmount);

    // 5. Verify Ledger entries
    const entries = await prisma.ledgerEntry.findMany({
      where: { walletBalanceId: { in: balances.map(b => b.id) } },
      orderBy: { createdAt: 'asc' }
    });

    expect(entries).toHaveLength(3);
    expect(entries.find(e => e.type === 'SWAP_FEE')?.delta.toString()).toBe('-15');
    expect(entries.find(e => e.type === 'SWAP_OUT')?.delta.toString()).toBe('-985');
    expect(entries.find(e => e.type === 'SWAP_IN')?.delta.toString()).toBe(quoteRes.body.destinationAmount);

    // 6. Verify quote is removed from Redis
    const cached = await redis.get(`swap:quote:${quoteId}`);
    expect(cached).toBeNull();
  });

  it('should return 410 Gone for expired or non-existent quote', async () => {
    await request(app.server)
      .post('/swap/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quoteId: '00000000-0000-0000-0000-000000000000' })
      .expect(410);
  });

  it('should return 422 Unprocessable Entity for insufficient balance', async () => {
    // Get a quote for 1000 BRL (user has 0)
    vi.spyOn(CoinGeckoClient, 'getExchangeRate').mockResolvedValue(new Decimal('1'));
    const quoteRes = await request(app.server)
      .get('/swap/quote?fromToken=BRL&toToken=ETH&amount=1000')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    await request(app.server)
      .post('/swap/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quoteId: quoteRes.body.id })
      .expect(422);
  });

  it('should return 403 Forbidden if quote belongs to another user', async () => {
    // 1. Create another user and get a quote
    await request(app.server)
      .post('/auth/register')
      .send({ email: 'other@example.com', password: 'password123' });
    
    const otherLogin = await request(app.server)
      .post('/auth/login')
      .send({ email: 'other@example.com', password: 'password123' });
    
    vi.spyOn(CoinGeckoClient, 'getExchangeRate').mockResolvedValue(new Decimal('1'));
    const otherQuoteRes = await request(app.server)
      .get('/swap/quote?fromToken=BRL&toToken=ETH&amount=100')
      .set('Authorization', `Bearer ${otherLogin.body.accessToken}`)
      .expect(200);

    // 2. Try to execute other user's quote with first user's token
    await request(app.server)
      .post('/swap/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quoteId: otherQuoteRes.body.id })
      .expect(403);
  });
});
