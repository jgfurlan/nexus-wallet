import { Prisma, LedgerEntryType, TokenSymbol } from '@prisma/client';
import Decimal from 'decimal.js';
import { prisma } from '../../lib/prisma';
import { WalletAuditResponse } from './ledger.schemas';

export class LedgerService {
  /**
   * Registers a ledger entry and updates the corresponding wallet balance.
   * MUST run inside an active database transaction client.
   */
  static async recordEntry(
    tx: Prisma.TransactionClient,
    data: {
      walletId: string;
      token: TokenSymbol;
      type: LedgerEntryType;
      delta: Decimal;
      transactionId?: string;
    }
  ) {
    // 1. Fetch and lock (if using transaction) the current balance record
    const walletBalance = await tx.walletBalance.findUniqueOrThrow({
      where: {
        walletId_token: {
          walletId: data.walletId,
          token: data.token,
        },
      },
    });

    const balanceBefore = walletBalance.amount;
    const balanceAfter = balanceBefore.add(data.delta);

    // 2. Update the wallet balance amount
    await tx.walletBalance.update({
      where: { id: walletBalance.id },
      data: { amount: balanceAfter },
    });

    // 3. Create the ledger entry record
    const entry = await tx.ledgerEntry.create({
      data: {
        walletBalanceId: walletBalance.id,
        type: data.type,
         delta: data.delta,
        balanceBefore,
        balanceAfter,
        transactionId: data.transactionId || null,
      },
    });

    return entry;
  }

  /**
   * Recalculates the cumulative sum of all ledger entry deltas for a wallet,
   * comparing them against stored balances to identify discrepancies.
   */
  static async auditWallet(walletId: string): Promise<WalletAuditResponse> {
    const wallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
      include: {
        balances: {
          include: {
            ledgerEntries: true,
          },
        },
      },
    });

    const auditItems = wallet.balances.map((balance) => {
      // Aggregate sum of deltas
      const calculated = balance.ledgerEntries.reduce(
        (sum, entry) => sum.add(entry.delta),
        new Decimal(0)
      );

      const storedBalance = balance.amount;
      const isConsistent = storedBalance.equals(calculated);

      return {
        token: balance.token,
        storedBalance: storedBalance.toString(),
        calculatedBalance: calculated.toString(),
        isConsistent,
      };
    });

    const isConsistent = auditItems.every((item) => item.isConsistent);

    return {
      walletId,
      isConsistent,
      audit: auditItems,
    };
  }
}
