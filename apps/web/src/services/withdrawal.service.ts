import api from './api';

/**
 * Request payload for creating a token withdrawal.
 */
export interface WithdrawalRequest {
  /** The ticker symbol of the token being withdrawn (e.g. 'BRL', 'BTC') */
  token: string;
  /** The amount to withdraw */
  amount: string;
  /** The target address or destination account (e.g. crypto address or email for PIX) */
  address: string;
  /** Unique idempotency key to prevent double withdrawals */
  externalId: string;
}

/**
 * Service handling withdrawal actions to the API.
 */
export const WithdrawalService = {
  /**
   * Submits a withdrawal request payload to the API.
   * 
   * @param data - The withdrawal payload parameters.
   * @returns A promise resolving to the created withdrawal Transaction details.
   */
  requestWithdrawal: async (data: WithdrawalRequest) => {
    const response = await api.post('/wallet/withdraw', data);
    return response.data;
  },
};
