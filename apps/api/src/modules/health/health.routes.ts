import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const healthRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['System'],
        response: {
          200: z.object({
            status: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      return reply.send({ status: 'ok' });
    }
  );
};
