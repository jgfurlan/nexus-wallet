import { z } from 'zod';
import { TokenSymbol } from '@prisma/client';
import Decimal from 'decimal.js';

export const SwapQuoteQuerySchema = z.object({
  fromToken: z.nativeEnum(TokenSymbol),
  toToken: z.nativeEnum(TokenSymbol),
  amount: z.string().refine((val) => {
    try {
      const d = new Decimal(val);
      return d.greaterThan(0);
    } catch {
      return false;
    }
  }, { message: 'Amount must be a positive decimal string' }),
});

export type SwapQuoteQuery = z.infer<typeof SwapQuoteQuerySchema>;

export const SwapExecuteInputSchema = z.object({
  quoteId: z.string().uuid(),
});

export type SwapExecuteInput = z.infer<typeof SwapExecuteInputSchema>;

export interface SwapQuoteResponse {
  id: string;
  userId: string;
  fromToken: TokenSymbol;
  toToken: TokenSymbol;
  sourceAmount: string;
  feeAmount: string;
  netAmount: string;
  destinationAmount: string;
  rate: string;
  expiresAt: number;
}
