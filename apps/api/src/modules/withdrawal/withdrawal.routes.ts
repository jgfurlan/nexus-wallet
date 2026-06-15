import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middleware/auth_guard';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalInputSchema, WithdrawalInput } from './withdrawal.schemas';

export const withdrawalRoutes = async (app: FastifyInstance) => {
  app.post<{ Body: WithdrawalInput }>(
    '/wallet/withdraw',
    {
      preHandler: [authGuard],
      schema: {
        body: WithdrawalInputSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;
      const transaction = await WithdrawalService.withdrawal_request(userId, request.body);
      return reply.send(transaction);
    }
  );
};
