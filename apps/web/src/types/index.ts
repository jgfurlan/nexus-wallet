export type TokenSymbol = 'BRL' | 'BTC' | 'ETH';
export type LedgerEntryType = 'DEPOSIT' | 'SWAP_IN' | 'SWAP_OUT' | 'SWAP_FEE' | 'WITHDRAWAL';
export type TransactionType = 'DEPOSIT' | 'SWAP' | 'WITHDRAWAL';

export interface User {
  id: string;
  email: string;
}

export interface Balance {
  token: TokenSymbol;
  amount: string;
}

export interface WalletBalancesResponse {
  walletId: string;
  balances: Balance[];
}

export interface LedgerEntry {
  id: string;
  walletBalanceId: string;
  type: LedgerEntryType;
  token: TokenSymbol; // Added missing token field
  delta: string;
  balanceBefore: string;
  balanceAfter: string;
  transactionId: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  fromToken: TokenSymbol | null;
  toToken: TokenSymbol | null;
  fromAmount: string | null;
  toAmount: string | null;
  feeAmount: string | null;
  rate: string | null;
  idempotencyKey: string | null;
  createdAt: string;
  ledgerEntries: LedgerEntry[];
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export interface SwapQuoteResponse {
  id: string;
  userId: string;
  fromToken: TokenSymbol;
  toToken: TokenSymbol;
  sourceAmount: string;
  feeAmount: string;
  netAmount: string;
  destinationAmount: string;
  rate: string;
  expiresAt: number;
}
