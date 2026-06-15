import { Prisma, TokenSymbol } from '@prisma/client';
import Decimal from 'decimal.js';
import { randomUUID } from 'crypto';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { CoinGeckoClient } from '../../lib/coingecko';
import { LedgerService } from '../ledger/ledger.service';
import { SwapQuoteResponse } from './swap.schemas';

const SWAP_FEE_PERCENTAGE = 0.015; // 1.5%
const QUOTE_TTL = 30; // 30 seconds

export class SwapService {
  static async swap_get_quote(userId: string, fromToken: TokenSymbol, toToken: TokenSymbol, amount: string): Promise<SwapQuoteResponse> {
    const rate = await CoinGeckoClient.getExchangeRate(fromToken, toToken);
    
    const sourceAmount = new Decimal(amount);
    const feeAmount = sourceAmount.mul(SWAP_FEE_PERCENTAGE);
    const netAmount = sourceAmount.minus(feeAmount);
    const destinationAmount = netAmount.mul(rate);

    const quoteId = randomUUID();
    const expiresAt = Date.now() + QUOTE_TTL * 1000;

    const quote: SwapQuoteResponse = {
      id: quoteId,
      userId,
      fromToken,
      toToken,
      sourceAmount: sourceAmount.toString(),
      feeAmount: feeAmount.toString(),
      netAmount: netAmount.toString(),
      destinationAmount: destinationAmount.toString(),
      rate: rate.toString(),
      expiresAt,
    };

    // Save to Redis
    const cacheKey = `swap:quote:${quoteId}`;
    await redis.set(cacheKey, JSON.stringify(quote), 'EX', QUOTE_TTL);

    return quote;
  }

  static async swap_execute(userId: string, quoteId: string) {
    const cacheKey = `swap:quote:${quoteId}`;
    const cachedQuote = await redis.get(cacheKey);

    if (!cachedQuote) {
      const error = new Error('Quote expired or not found');
      Object.assign(error, { statusCode: 410, code: 'QUOTE_EXPIRED' });
      throw error;
    }

    const quote: SwapQuoteResponse = JSON.parse(cachedQuote);

    if (quote.userId !== userId) {
      const error = new Error('Quote does not belong to user');
      Object.assign(error, { statusCode: 403, code: 'FORBIDDEN' });
      throw error;
    }

    // Execute in a Serializable transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Get user's wallet
      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { userId },
        include: { balances: true },
      });

      const fromBalance = wallet.balances.find(b => b.token === quote.fromToken);
      
      if (!fromBalance || fromBalance.amount.lessThan(quote.sourceAmount)) {
        const error = new Error('Insufficient balance');
        Object.assign(error, { statusCode: 422, code: 'INSUFFICIENT_BALANCE' });
        throw error;
      }

      // 2. Create Transaction record
      const swapTransaction = await tx.transaction.create({
        data: {
          userId,
          type: 'SWAP',
          fromToken: quote.fromToken,
          toToken: quote.toToken,
          fromAmount: new Decimal(quote.sourceAmount),
          toAmount: new Decimal(quote.destinationAmount),
          feeAmount: new Decimal(quote.feeAmount),
          rate: new Decimal(quote.rate),
        },
      });

      // 3. Record Ledger Entries
      // Debit Fee
      await LedgerService.recordEntry(tx, {
        walletId: wallet.id,
        token: quote.fromToken,
        type: 'SWAP_FEE',
        delta: new Decimal(quote.feeAmount).negated(),
        transactionId: swapTransaction.id,
      });

      // Debit Net Amount
      await LedgerService.recordEntry(tx, {
        walletId: wallet.id,
        token: quote.fromToken,
        type: 'SWAP_OUT',
        delta: new Decimal(quote.netAmount).negated(),
        transactionId: swapTransaction.id,
      });

      // Credit Destination Amount
      await LedgerService.recordEntry(tx, {
        walletId: wallet.id,
        token: quote.toToken,
        type: 'SWAP_IN',
        delta: new Decimal(quote.destinationAmount),
        transactionId: swapTransaction.id,
      });

      return swapTransaction;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    // 4. Remove quote from Redis
    await redis.del(cacheKey);

    return transaction;
  }
}
