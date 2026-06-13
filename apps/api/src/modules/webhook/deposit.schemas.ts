import { z } from 'zod';
import { TokenSymbol } from '@prisma/client';
import Decimal from 'decimal.js';

export const DepositWebhookInputSchema = z.object({
  walletId: z.string(),
  token: z.nativeEnum(TokenSymbol),
  amount: z.string().refine(
    (val) => {
      try {
        const d = new Decimal(val);
        return d.greaterThan(0);
      } catch {
        return false;
      }
    },
    { message: 'Amount must be a positive decimal string' }
  ),
  idempotencyKey: z.string().min(1),
});

export type DepositWebhookInput = z.infer<typeof DepositWebhookInputSchema>;

export const DepositWebhookResponseSchema = z.object({
  transaction: z.object({
    id: z.string(),
    userId: z.string(),
    type: z.string(),
    fromToken: z.string().nullable(),
    toToken: z.string().nullable(),
    fromAmount: z.any().nullable(),
    toAmount: z.any().nullable(),
    feeAmount: z.any().nullable(),
    rate: z.any().nullable(),
    idempotencyKey: z.string().nullable(),
    createdAt: z.any(),
  }),
});

