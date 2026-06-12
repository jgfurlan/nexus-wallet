import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { healthRoutes } from './modules/health/health.routes';

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

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name,
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
