import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { walletRoutes } from './modules/wallet/wallet.routes';
import { ledgerRoutes } from './modules/ledger/ledger.routes';
import { depositRoutes } from './modules/webhook/deposit.routes';
import { swapRoutes } from './modules/swap/swap.routes';
import { withdrawalRoutes } from './modules/withdrawal/withdrawal.routes';
import { historyRoutes } from './modules/wallet/history.routes';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email?: string;
      signup?: boolean;
      type?: string;
      jti?: string;
    };
    user: { sub: string; email: string };
  }
}

export const buildApp = () => {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register JWT plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'nexus_super_secret_key_1234567890_change_me_in_prod',
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'NexusWallet API',
        description: 'REST API for Simplified Crypto Wallet',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Register modules
  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(walletRoutes);
  app.register(ledgerRoutes);
  app.register(depositRoutes);
  app.register(swapRoutes);
  app.register(withdrawalRoutes);
  app.register(historyRoutes);

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.code || error.name,
        message: error.message,
      });
    }

    return reply.status(500).send({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    });
  });

  // 404 Handler
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      error: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  return app;
};
