import api from './api';

export interface WithdrawalRequest {
  token: string;
  amount: string;
  destinationAddress: string;
}

export const WithdrawalService = {
  requestWithdrawal: async (data: WithdrawalRequest) => {
    const response = await api.post('/withdrawals', data);
    return response.data;
  },
};
