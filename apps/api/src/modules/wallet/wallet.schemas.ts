import { z } from 'zod';

export const BalanceSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  amount: z.string(),
});

export const WalletBalancesResponseSchema = z.object({
  walletId: z.string(),
  balances: z.array(BalanceSchema),
});

export type WalletBalancesResponse = z.infer<typeof WalletBalancesResponseSchema>;
