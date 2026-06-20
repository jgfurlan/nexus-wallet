import api from './api';

export interface WithdrawalRequest {
  token: string;
  amount: string;
  address: string;
  externalId: string;
}

export const WithdrawalService = {
  requestWithdrawal: async (data: WithdrawalRequest) => {
    const response = await api.post('/wallet/withdraw', data);
    return response.data;
  },
};
