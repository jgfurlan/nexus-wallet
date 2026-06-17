import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateFeedbackInputSchema, CreateFeedbackInput, FeedbackResponseSchema } from './feedback.schemas';
import { FeedbackService } from './feedback.service';
import { authGuard } from '../../middleware/auth_guard';

export const feedbackRoutes = async (app: FastifyInstance) => {
  app.post(
    '/feedbacks',
    {
      preHandler: authGuard,
      schema: {
        description: 'Submit user feedback',
        tags: ['Feedback'],
        security: [{ bearerAuth: [] }],
        body: CreateFeedbackInputSchema,
        response: {
          201: FeedbackResponseSchema,
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.sub;
      const input = request.body as CreateFeedbackInput;

      const feedback = await FeedbackService.createFeedback(userId, input);

      return reply.status(201).send({
        id: feedback.id,
        userId: feedback.userId,
        message: feedback.message,
        rating: feedback.rating,
        createdAt: feedback.createdAt.toISOString(),
      });
    }
  );
};
