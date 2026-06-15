import Decimal from 'decimal.js';
import { redis } from './redis';
import { TokenSymbol } from '@prisma/client';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_TTL = 30; // 30 seconds

export class CoinGeckoClient {
  private static async fetchPricesFromAPI() {
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}?ids=bitcoin,ethereum&vs_currencies=brl`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        BTC: new Decimal(data.bitcoin.brl),
        ETH: new Decimal(data.ethereum.brl),
        BRL: new Decimal(1), // BRL is the base for our rates here
      };
    } catch (error) {
      console.error('Failed to fetch prices from CoinGecko:', error);
      throw error;
    }
  }

  static async getExchangeRate(fromToken: TokenSymbol, toToken: TokenSymbol): Promise<Decimal> {
    if (fromToken === toToken) {
      return new Decimal(1);
    }

    // Check cache
    const cacheKey = 'coingecko:prices';
    const cachedData = await redis.get(cacheKey);
    let prices: Record<string, Decimal>;

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      prices = {
        BTC: new Decimal(parsed.BTC),
        ETH: new Decimal(parsed.ETH),
        BRL: new Decimal(parsed.BRL),
      };
    } else {
      prices = await this.fetchPricesFromAPI();
      await redis.set(
        cacheKey,
        JSON.stringify({
          BTC: prices.BTC.toString(),
          ETH: prices.ETH.toString(),
          BRL: prices.BRL.toString(),
        }),
        'EX',
        CACHE_TTL
      );
    }

    // All prices are in BRL. 
    // Example: BRL -> BTC
    // Rate = fromPrice / toPrice = 1 / 300000 = 0.0000033333
    // Example: BTC -> BRL
    // Rate = fromPrice / toPrice = 300000 / 1 = 300000
    
    const fromPrice = prices[fromToken as keyof typeof prices];
    const toPrice = prices[toToken as keyof typeof prices];

    if (!fromPrice || !toPrice) {
      throw new Error(`Price not found for ${fromToken} or ${toToken}`);
    }

    return fromPrice.div(toPrice);
  }
}
