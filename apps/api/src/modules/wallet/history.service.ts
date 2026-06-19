import { prisma } from '../../lib/prisma';
import { HistoryQuery, PaginatedResponse } from './history.schemas';
import { Transaction, LedgerEntry, TokenSymbol } from '@prisma/client';

export type TransactionWithLedger = Transaction & {
  ledgerEntries: (LedgerEntry & { token: TokenSymbol })[];
};

export class HistoryService {
  static async history_list_user_transactions(
    userId: string,
    query: HistoryQuery
  ): Promise<PaginatedResponse<TransactionWithLedger>> {
    const { token, type, cursor, limit } = query;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(token && {
          OR: [{ fromToken: token }, { toToken: token }],
        }),
        ...(type && { type }),
      },
      take: limit + 1, // Pegamos um extra para verificar se há próxima página
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // Pular o próprio item do cursor
      orderBy: { createdAt: 'desc' },
      include: {
        ledgerEntries: {
          include: {
            walletBalance: true,
          },
        },
      },
    });

    const mappedTransactions = transactions.map((t) => {
      const mappedLedgerEntries = t.ledgerEntries.map((le) => {
        const { walletBalance, ...rest } = le;
        return {
          ...rest,
          token: walletBalance.token,
        };
      });
      return {
        ...t,
        ledgerEntries: mappedLedgerEntries,
      };
    });

    let nextCursor: string | null = null;
    if (mappedTransactions.length > limit) {
      mappedTransactions.pop();
      const lastItem = mappedTransactions[mappedTransactions.length - 1];
      nextCursor = lastItem.id;
    }

    return {
      data: mappedTransactions,
      nextCursor,
    };
  }
}
