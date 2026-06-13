import { z } from 'zod';

export const AuditItemSchema = z.object({
  token: z.enum(['BRL', 'BTC', 'ETH']),
  storedBalance: z.string(),
  calculatedBalance: z.string(),
  isConsistent: z.boolean(),
});

export const WalletAuditResponseSchema = z.object({
  walletId: z.string(),
  isConsistent: z.boolean(),
  audit: z.array(AuditItemSchema),
});

export type WalletAuditResponse = z.infer<typeof WalletAuditResponseSchema>;
