import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { prisma } from '../../lib/prisma';
import { LedgerService } from '../ledger/ledger.service';
import { DepositWebhookInput } from './deposit.schemas';

/**
 * Deposit service handling incoming deposit webhooks with 
 * idempotency checks and atomic ledger credits.
 */
export class DepositService {
  /**
   * Processes the deposit webhook within an atomic Serializable transaction.
   * Ensures idempotency by checking if the idempotencyKey has already been processed.
   * 
   * @param input - The deposit webhook payload including userId, token, amount, and idempotencyKey.
   * @returns A promise resolving to the created transaction and a flag indicating if it was a duplicate.
   * @throws {Error} WALLET_NOT_FOUND (404) if the wallet does not exist for the user.
   */
  static async deposit_process_webhook(input: DepositWebhookInput) {
    return await prisma.$transaction(
      async (tx) => {
        // 1. Check if the idempotency key already exists
        const existingTx = await tx.transaction.findUnique({
          where: { idempotencyKey: input.idempotencyKey },
        });

        if (existingTx) {
          return {
            transaction: existingTx,
            isDuplicate: true,
          };
        }

        // 2. Fetch the wallet to get the userId and verify it exists
        const wallet = await tx.wallet.findUnique({
          where: { userId: input.userId },
        });

        if (!wallet) {
          throw Object.assign(new Error('Wallet not found'), {
            statusCode: 404,
            code: 'WALLET_NOT_FOUND',
          });
        }

        // 3. Create the macro transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId: wallet.userId,
            type: 'DEPOSIT',
            toToken: input.token,
            toAmount: new Decimal(input.amount),
            idempotencyKey: input.idempotencyKey,
          },
        });

        // 4. Update the wallet balance and create a ledger entry
        await LedgerService.recordEntry(tx, {
          walletId: wallet.id,
          token: input.token,
          type: 'DEPOSIT',
          delta: new Decimal(input.amount),
          transactionId: transaction.id,
        });

        return {
          transaction,
          isDuplicate: false,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }
}
