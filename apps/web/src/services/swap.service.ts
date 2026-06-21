import api from './api';
import { SwapQuoteResponse, Transaction } from '../types';

/**
 * Service handling cryptocurrency and fiat swap operations.
 */
export class SwapService {
  /**
   * Requests a temporary swap quote from the API.
   * 
   * @param fromToken - The token ticker symbol to swap from.
   * @param toToken - The token ticker symbol to swap to.
   * @param amount - The raw source amount.
   * @returns A promise resolving to the SwapQuoteResponse.
   */
  static async getQuote(fromToken: string, toToken: string, amount: string): Promise<SwapQuoteResponse> {
    const response = await api.get('/swap/quote', {
      params: { fromToken, toToken, amount },
    });
    return response.data;
  }

  /**
   * Retrieves the raw exchange rates relative to BRL for all supported assets.
   * 
   * @returns A promise resolving to a map of token symbols to exchange rate values.
   */
  static async getRates(): Promise<Record<string, string>> {
    const response = await api.get('/swap/rates');
    return response.data;
  }

  /**
   * Executes a swap operation using a previously obtained, unexpired quote ID.
   * 
   * @param quoteId - The identifier of the active quote.
   * @returns A promise resolving to the executed swap Transaction details.
   */
  static async executeSwap(quoteId: string): Promise<Transaction> {
    const response = await api.post('/swap/execute', { quoteId });
    return response.data;
  }
}
