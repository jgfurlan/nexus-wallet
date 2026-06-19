import { FastifyInstance } from 'fastify';
import { TokenSymbol } from '@prisma/client';
import { authGuard } from '../../middleware/auth_guard';
import { SwapService } from './swap.service';
import { SwapQuoteQuerySchema, SwapExecuteInputSchema, SwapQuoteQuery, SwapExecuteInput } from './swap.schemas';

export const swapRoutes = async (app: FastifyInstance) => {
  app.get(
    '/swap/rates',
    {
      preHandler: [authGuard],
    },
    async (_request, reply) => {
      const rates = await SwapService.swap_get_rates();
      return reply.send(rates);
    }
  );

  app.get<{ Querystring: SwapQuoteQuery }>(
    '/swap/quote',
    {
      preHandler: [authGuard],
      schema: {
        querystring: SwapQuoteQuerySchema,
      },
    },
    async (request, reply) => {
      const { fromToken, toToken, amount } = request.query;
      const userId = request.user.sub;

      const quote = await SwapService.swap_get_quote(
        userId,
        fromToken as TokenSymbol,
        toToken as TokenSymbol,
        amount
      );
      return reply.send(quote);
    }
  );

  app.post<{ Body: SwapExecuteInput }>(
    '/swap/execute',
    {
      preHandler: [authGuard],
      schema: {
        body: SwapExecuteInputSchema,
      },
    },
    async (request, reply) => {
      const { quoteId } = request.body;
      const userId = request.user.sub;

      const transaction = await SwapService.swap_execute(userId, quoteId);
      return reply.send(transaction);
    }
  );
};

