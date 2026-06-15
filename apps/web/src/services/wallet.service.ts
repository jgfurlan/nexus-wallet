import api from './api';
import { WalletBalancesResponse } from '../types';

export class WalletService {
  static async getBalances(): Promise<WalletBalancesResponse> {
    const response = await api.get('/wallet/balances');
    return response.data;
  }
}
