import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../../middleware/auth_guard';
import { WalletAuditResponseSchema } from './ledger.schemas';
import { LedgerService } from './ledger.service';

const AuditParamsSchema = z.object({
  walletId: z.string(),
});

type AuditParams = z.infer<typeof AuditParamsSchema>;

export const ledgerRoutes = async (app: FastifyInstance) => {
  app.get(
    '/admin/audit/:walletId',
    {
      preHandler: authGuard,
      schema: {
        description: 'Audit wallet balance calculation and consistency',
        tags: ['Admin / Ledger'],
        security: [{ BearerAuth: [] }],
        params: AuditParamsSchema,
        response: {
          200: WalletAuditResponseSchema,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { walletId } = request.params as AuditParams;
      const audit = await LedgerService.auditWallet(walletId);
      return reply.status(200).send(audit);
    }
  );
};
