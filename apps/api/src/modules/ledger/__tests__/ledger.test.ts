import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../../../app';
import { redis } from '../../../lib/redis';
import { prisma } from '../../../lib/prisma';
import { LedgerService } from '../ledger.service';
import Decimal from 'decimal.js';

describe('Ledger Module Integration Tests', () => {
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

  it('should calculate balanceBefore and balanceAfter correctly on recordEntry', async () => {
    // 1. Create a user and get their wallet
    const regRes = await request(app.server)
      .post('/auth/register')
      .send({
        email: 'ledger@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const userId = regRes.body.id;
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { userId },
      include: { balances: true },
    });

    const brlBalance = wallet.balances.find((b) => b.token === 'BRL')!;

    // 2. Perform credit (Deposit) using LedgerService
    await prisma.$transaction(async (tx) => {
      await LedgerService.recordEntry(tx, {
        walletId: wallet.id,
        token: 'BRL',
        type: 'DEPOSIT',
        delta: new Decimal(100),
      });
    });

    // Verify first entry
    let entries = await prisma.ledgerEntry.findMany({
      where: { walletBalanceId: brlBalance.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(entries).toHaveLength(1);
    expect(Number(entries[0].balanceBefore)).toBe(0);
    expect(Number(entries[0].delta)).toBe(100);
    expect(Number(entries[0].balanceAfter)).toBe(100);

    // Verify wallet balance is updated
    let updatedBalance = await prisma.walletBalance.findUniqueOrThrow({
      where: { id: brlBalance.id },
    });
    expect(Number(updatedBalance.amount)).toBe(100);

    // 3. Perform debit (Withdrawal) using LedgerService
    await prisma.$transaction(async (tx) => {
      await LedgerService.recordEntry(tx, {
        walletId: wallet.id,
        token: 'BRL',
        type: 'WITHDRAWAL',
        delta: new Decimal(-30),
      });
    });

    // Verify second entry
    entries = await prisma.ledgerEntry.findMany({
      where: { walletBalanceId: brlBalance.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(entries).toHaveLength(2);
    expect(Number(entries[1].balanceBefore)).toBe(100);
    expect(Number(entries[1].delta)).toBe(-30);
    expect(Number(entries[1].balanceAfter)).toBe(70);

    updatedBalance = await prisma.walletBalance.findUniqueOrThrow({
      where: { id: brlBalance.id },
    });
    expect(Number(updatedBalance.amount)).toBe(70);
  });

  it('should return isConsistent: true for a valid wallet ledger state', async () => {
    // 1. Register and login
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'audit-ok@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'audit-ok@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const token = loginRes.body.accessToken;

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'audit-ok@example.com' },
      include: { wallet: true },
    });

    const walletId = user.wallet!.id;

    // 2. Perform some balance movements
    await prisma.$transaction(async (tx) => {
      await LedgerService.recordEntry(tx, {
        walletId,
        token: 'BRL',
        type: 'DEPOSIT',
        delta: new Decimal(200),
      });
      await LedgerService.recordEntry(tx, {
        walletId,
        token: 'BTC',
        type: 'DEPOSIT',
        delta: new Decimal('0.5'),
      });
    });

    // 3. Run audit endpoint
    const auditRes = await request(app.server)
      .get(`/admin/audit/${walletId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(auditRes.body.isConsistent).toBe(true);
    
    const brlAudit = auditRes.body.audit.find((a: { token: string }) => a.token === 'BRL');
    expect(Number(brlAudit.storedBalance)).toBe(200);
    expect(Number(brlAudit.calculatedBalance)).toBe(200);
    expect(brlAudit.isConsistent).toBe(true);

    const btcAudit = auditRes.body.audit.find((a: { token: string }) => a.token === 'BTC');
    expect(Number(btcAudit.storedBalance)).toBe(0.5);
    expect(Number(btcAudit.calculatedBalance)).toBe(0.5);
    expect(btcAudit.isConsistent).toBe(true);
  });

  it('should detect inconsistency if wallet balance is manipulated directly (isConsistent: false)', async () => {
    // 1. Register and login
    await request(app.server)
      .post('/auth/register')
      .send({
        email: 'audit-fail@example.com',
        password: 'securepassword123',
      })
      .expect(201);

    const loginRes = await request(app.server)
      .post('/auth/login')
      .send({
        email: 'audit-fail@example.com',
        password: 'securepassword123',
      })
      .expect(200);

    const token = loginRes.body.accessToken;

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'audit-fail@example.com' },
      include: { wallet: { include: { balances: true } } },
    });

    const walletId = user.wallet!.id;
    const brlBalance = user.wallet!.balances.find((b) => b.token === 'BRL')!;

    // 2. Perform deposit
    await prisma.$transaction(async (tx) => {
      await LedgerService.recordEntry(tx, {
        walletId,
        token: 'BRL',
        type: 'DEPOSIT',
        delta: new Decimal(100),
      });
    });

    // 3. Artificially alter the balance directly in database (bypass ledger)
    await prisma.walletBalance.update({
      where: { id: brlBalance.id },
      data: { amount: new Decimal(999) },
    });

    // 4. Hit audit endpoint - should detect inconsistency
    const auditRes = await request(app.server)
      .get(`/admin/audit/${walletId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(auditRes.body.isConsistent).toBe(false);

    const brlAudit = auditRes.body.audit.find((a: { token: string }) => a.token === 'BRL');
    expect(Number(brlAudit.storedBalance)).toBe(999);
    expect(Number(brlAudit.calculatedBalance)).toBe(100);
    expect(brlAudit.isConsistent).toBe(false);
  });

  it('should block audit access if unauthenticated', async () => {
    await request(app.server)
      .get('/admin/audit/some-wallet-id')
      .expect(401);
  });
});
