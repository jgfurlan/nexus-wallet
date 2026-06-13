import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { RegisterInputSchema, LoginInputSchema, RefreshInputSchema, AuthResponseSchema } from './auth.schemas';
import { AuthService } from './auth.service';
import { z } from 'zod';

export const authRoutes = async (app: FastifyInstance) => {
  const typeProviderApp = app.withTypeProvider<ZodTypeProvider>();

  typeProviderApp.post(
    '/auth/register',
    {
      schema: {
        description: 'Register a new user and wallet',
        tags: ['Authentication'],
        body: RegisterInputSchema,
        response: {
          201: z.object({
            id: z.string(),
            email: z.string(),
            createdAt: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = await AuthService.registerUser(request.body);
      return reply.status(201).send(user);
    }
  );

  typeProviderApp.post(
    '/auth/login',
    {
      schema: {
        description: 'Login with email and password to receive JWT tokens',
        tags: ['Authentication'],
        body: LoginInputSchema,
        response: {
          200: AuthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tokens = await AuthService.loginUser(app, request.body);
      return reply.status(200).send(tokens);
    }
  );

  typeProviderApp.post(
    '/auth/refresh',
    {
      schema: {
        description: 'Refresh access token using refresh token rotation',
        tags: ['Authentication'],
        body: RefreshInputSchema,
        response: {
          200: AuthResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const tokens = await AuthService.refreshSession(app, request.body.refreshToken);
      return reply.status(200).send(tokens);
    }
  );
};
