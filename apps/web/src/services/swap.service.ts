import api from './api';
import { SwapQuoteResponse, Transaction } from '../types';

export class SwapService {
  static async getQuote(fromToken: string, toToken: string, amount: string): Promise<SwapQuoteResponse> {
    const response = await api.get('/swap/quote', {
      params: { fromToken, toToken, amount },
    });
    return response.data;
  }

  static async getRates(): Promise<Record<string, string>> {
    const response = await api.get('/swap/rates');
    return response.data;
  }

  static async executeSwap(quoteId: string): Promise<Transaction> {
    const response = await api.post('/swap/execute', { quoteId });
    return response.data;
  }
}
