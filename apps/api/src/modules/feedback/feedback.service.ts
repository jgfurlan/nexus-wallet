import { prisma } from '../../lib/prisma';
import { CreateFeedbackInput } from './feedback.schemas';

export class FeedbackService {
  static async createFeedback(userId: string, input: CreateFeedbackInput) {
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        message: input.message,
        rating: input.rating,
      },
    });

    return feedback;
  }
}
