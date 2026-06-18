import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { DepositService } from '../webhook/deposit.service';
import { prisma } from '../../lib/prisma';
import { authGuard } from '../../middleware/auth_guard';

export const faucetRoutes = async (app: FastifyInstance) => {
  app.post(
    '/test/faucet',
    {
      preHandler: authGuard,
      schema: {
        description: 'Inject test funds into the authenticated user wallet',
        tags: ['Test'],
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            message: z.string(),
            amount: z.string(),
            token: z.string()
          }),
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.sub;

      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        return reply.status(404).send({
          error: 'WALLET_NOT_FOUND',
          message: 'Wallet not found for this user',
        });
      }

      const amount = '1000';
      const token = 'BRL';
      const idempotencyKey = `faucet_${userId}_${crypto.randomUUID()}`;

      await DepositService.deposit_process_webhook({
        walletId: wallet.id,
        token: token as "BRL",
        amount,
        idempotencyKey,
      });

      return reply.status(200).send({
        message: 'Funds injected successfully',
        amount,
        token,
      });
    }
  );
};
