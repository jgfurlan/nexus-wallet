import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authGuard } from '../../middleware/auth_guard';
import { WalletBalancesResponseSchema } from './wallet.schemas';
import { WalletService } from './wallet.service';

export const walletRoutes = async (app: FastifyInstance) => {
  app.get(
    '/wallet/balances',
    {
      preHandler: authGuard,
      schema: {
        description: 'Get authenticated user wallet balances',
        tags: ['Wallet'],
        security: [{ BearerAuth: [] }],
        response: {
          200: WalletBalancesResponseSchema,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Cast user payload from fastify-jwt
      const user = request.user as { sub: string; email: string };
      const balances = await WalletService.getBalances(user.sub);
      return reply.status(200).send(balances);
    }
  );
};
