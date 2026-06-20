import api from './api';
import { Transaction, PaginatedResponse } from '../types';

/**
 * Options for querying user transaction history with filtering and pagination.
 */
export interface HistoryQuery {
  /** Optional token ticker symbol to filter (e.g. 'BRL') */
  token?: string;
  /** Optional transaction type filter (e.g. 'DEPOSIT') */
  type?: string;
  /** Pagination cursor (typically the last transaction ID) */
  cursor?: string;
  /** Pagination limit (number of transactions to fetch) */
  limit?: number;
}

/**
 * Service to query transaction history details from the API.
 */
export class HistoryService {
  /**
   * Retrieves a paginated list of user transactions based on query parameters.
   * 
   * @param query - The filter and pagination options.
   * @returns A promise resolving to the PaginatedResponse of Transactions.
   */
  static async getHistory(query: HistoryQuery): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/wallet/history', {
      params: query,
    });
    return response.data;
  }
}
