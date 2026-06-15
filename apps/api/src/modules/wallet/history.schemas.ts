import { z } from 'zod';
import { TokenSymbol, TransactionType } from '@prisma/client';

export const HistoryQuerySchema = z.object({
  token: z.nativeEnum(TokenSymbol).optional(),
  type: z.nativeEnum(TransactionType).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
