import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { walletRoutes } from './modules/wallet/wallet.routes';
import { ledgerRoutes } from './modules/ledger/ledger.routes';
import { depositRoutes } from './modules/webhook/deposit.routes';
import { swapRoutes } from './modules/swap/swap.routes';
import { withdrawalRoutes } from './modules/withdrawal/withdrawal.routes';
import { historyRoutes } from './modules/wallet/history.routes';
import { feedbackRoutes } from './modules/feedback/feedback.routes';
import { faucetRoutes } from './modules/test/faucet.routes';

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

  // Register CORS
  app.register(cors, {
    origin: [
      'http://localhost:5173',
      'https://nexus-wallet-ashy.vercel.app',
      /https:\/\/nexus-wallet-.*\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflight: true,
    strictPreflight: false,
  });

  // Register JWT plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'nexus_super_secret_key_1234567890_change_me_in_prod',
    cookie: {
      cookieName: 'nexus_token',
      signed: false,
    },
  });

  // Register Cookie plugin
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'nexus_super_secret_cookie_key',
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
  app.register(feedbackRoutes);
  app.register(faucetRoutes);

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
