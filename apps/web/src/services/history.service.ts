import api from './api';
import { Transaction, PaginatedResponse } from '../types';

export interface HistoryQuery {
  token?: string;
  type?: string;
  cursor?: string;
  limit?: number;
}

export class HistoryService {
  static async getHistory(query: HistoryQuery): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/wallet/history', {
      params: query,
    });
    return response.data;
  }
}
