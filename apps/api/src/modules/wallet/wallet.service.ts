import { prisma } from '../../lib/prisma';
import { WalletBalancesResponse } from './wallet.schemas';

export class WalletService {
  static async getBalances(userId: string): Promise<WalletBalancesResponse> {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        balances: true,
      },
    });

    // Fallback: If wallet is missing due to database anomaly/corruption, recreate on the fly
    if (!wallet) {
      wallet = await prisma.$transaction(async (tx) => {
        const newWallet = await tx.wallet.create({
          data: {
            userId,
          },
        });

        await tx.walletBalance.createMany({
          data: [
            { walletId: newWallet.id, token: 'BRL', amount: 0 },
            { walletId: newWallet.id, token: 'BTC', amount: 0 },
            { walletId: newWallet.id, token: 'ETH', amount: 0 },
          ],
        });

        return tx.wallet.findUniqueOrThrow({
          where: { id: newWallet.id },
          include: {
            balances: true,
          },
        });
      });
    }

    return {
      walletId: wallet.id,
      balances: wallet.balances.map((b) => ({
        token: b.token,
        amount: b.amount.toString(),
      })),
    };
  }
}
