import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { DepositWebhookInputSchema, DepositWebhookInput, DepositWebhookResponseSchema } from './deposit.schemas';
import { DepositService } from './deposit.service';

export const depositRoutes = async (app: FastifyInstance) => {
  app.post(
    '/webhooks/deposit',
    {
      schema: {
        description: 'Webhook to process external user deposits (BRL, BTC, ETH)',
        tags: ['Webhooks'],
        body: DepositWebhookInputSchema,
        response: {
          201: DepositWebhookResponseSchema,
          200: DepositWebhookResponseSchema,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // 1. Verify HMAC SHA256 Signature
      const signatureHeader = request.headers['x-webhook-signature'];
      if (!signatureHeader || typeof signatureHeader !== 'string') {
        return reply.status(401).send({
          error: 'INVALID_SIGNATURE',
          message: 'Webhook signature header missing or invalid',
        });
      }

      const secret = process.env.WEBHOOK_SECRET;
      if (!secret) {
        request.log.error('WEBHOOK_SECRET environment variable is not set');
        return reply.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Server configuration error',
        });
      }

      // Re-serialize parsed body to compare signatures
      const payload = JSON.stringify(request.body);
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const headerBuffer = Buffer.from(signatureHeader, 'hex');
      const computedBuffer = Buffer.from(computedSignature, 'hex');

      // Constant-time comparison to prevent timing attacks
      if (
        headerBuffer.length !== computedBuffer.length ||
        !crypto.timingSafeEqual(headerBuffer, computedBuffer)
      ) {
        return reply.status(401).send({
          error: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
        });
      }

      // 2. Process deposit
      const input = request.body as DepositWebhookInput;
      const { transaction, isDuplicate } = await DepositService.deposit_process_webhook(input);

      // Return 200 OK for duplicates, 201 Created for new deposits
      const statusCode = isDuplicate ? 200 : 201;
      return reply.status(statusCode).send({ transaction });
    }
  );
};
