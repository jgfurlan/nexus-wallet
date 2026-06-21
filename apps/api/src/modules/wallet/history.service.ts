import { prisma } from '../../lib/prisma';
import { HistoryQuery, PaginatedResponse } from './history.schemas';
import { Transaction, LedgerEntry, TokenSymbol } from '@prisma/client';

export type TransactionWithLedger = Transaction & {
  ledgerEntries: (LedgerEntry & { token: TokenSymbol })[];
};

/**
 * History service responsible for retrieving and paginating user transactions 
 * along with their corresponding ledger entries.
 */
export class HistoryService {
  /**
   * Lists and paginates a user's transaction history, with optional filtering 
   * by token symbol and transaction type.
   * 
   * @param userId - The unique identifier of the user.
   * @param query - Pagination and filtering options (limit, cursor, token, type).
   * @returns A promise resolving to a paginated list of transactions with their ledger entries.
   */
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
