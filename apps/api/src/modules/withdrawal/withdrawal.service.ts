import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { prisma } from '../../lib/prisma';
import { LedgerService } from '../ledger/ledger.service';
import { WithdrawalInput } from './withdrawal.schemas';

/**
 * Withdrawal service handling withdrawal requests (fiat/crypto cash-out) 
 * with idempotency checks and atomic ledger entries.
 */
export class WithdrawalService {
  /**
   * Processes a withdrawal request. Uses serialization isolation to avoid race conditions 
   * and verifies idempotency via an externalId.
   * 
   * @param userId - The unique identifier of the user requesting the withdrawal.
   * @param input - The withdrawal parameters containing token, amount, destination address, and externalId.
   * @returns A promise resolving to the created/existing transaction.
   * @throws {Error} FORBIDDEN (403) if the idempotency key belongs to another user.
   * @throws {Error} INSUFFICIENT_BALANCE (422) if the user has insufficient balance.
   */
  static async withdrawal_request(userId: string, input: WithdrawalInput) {
    return await prisma.$transaction(
      async (tx) => {
        // 1. Idempotência: verificar se externalId já existe
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey: input.externalId },
        });

        if (existingTx) {
          if (existingTx.userId !== userId) {
            const error = new Error('Chave de idempotência pertence a outro usuário');
            Object.assign(error, { statusCode: 403, code: 'FORBIDDEN' });
            throw error;
          }
          return existingTx;
        }

        // 2. Buscar carteira e validar saldo
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { userId },
          include: { balances: true },
        });

        const balance = wallet.balances.find((b) => b.token === input.token);
        const amount = new Decimal(input.amount);

        if (!balance || balance.amount.lessThan(amount)) {
          const error = new Error('Saldo insuficiente para o saque');
          Object.assign(error, { statusCode: 422, code: 'INSUFFICIENT_BALANCE' });
          throw error;
        }

        // 3. Criar registro de Transação macro
        const withdrawalTransaction = await tx.transaction.create({
          data: {
            userId,
            type: 'WITHDRAWAL',
            fromToken: input.token,
            fromAmount: amount,
            idempotencyKey: input.externalId,
          },
        });

        // 4. Registrar débito no Ledger (delta negativo)
        await LedgerService.recordEntry(tx, {
          walletId: wallet.id,
          token: input.token,
          type: 'WITHDRAWAL',
          delta: amount.negated(),
          transactionId: withdrawalTransaction.id,
        });

        return withdrawalTransaction;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }
}
