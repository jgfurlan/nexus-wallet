import { FastifyInstance } from 'fastify';
import { authGuard } from '../../middleware/auth_guard';
import { HistoryService } from './history.service';
import { HistoryQuerySchema, HistoryQuery } from './history.schemas';

export const historyRoutes = async (app: FastifyInstance) => {
  app.get<{ Querystring: HistoryQuery }>(
    '/wallet/history',
    {
      preHandler: [authGuard],
      schema: {
        querystring: HistoryQuerySchema,
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;
      const result = await HistoryService.history_list_user_transactions(userId, request.query);
      return reply.send(result);
    }
  );
};
