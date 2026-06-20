import api from './api';
import { WalletBalancesResponse } from '../types';

/**
 * Service handling wallet accounts and balances retrieval from the API.
 */
export class WalletService {
  /**
   * Retrieves the current token balances (BRL, BTC, ETH) for the authenticated user's wallet.
   * 
   * @returns A promise resolving to the user's WalletBalancesResponse.
   */
  static async getBalances(): Promise<WalletBalancesResponse> {
    const response = await api.get('/wallet/balances');
    return response.data;
  }
}
