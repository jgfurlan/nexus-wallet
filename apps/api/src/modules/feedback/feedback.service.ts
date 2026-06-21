import { prisma } from '../../lib/prisma';
import { CreateFeedbackInput } from './feedback.schemas';

/**
 * Feedback service responsible for recording user feedback messages 
 * and rating metrics in the database.
 */
export class FeedbackService {
  /**
   * Creates a new user feedback record containing message text and rating score.
   * 
   * @param userId - The unique identifier of the user submitting feedback.
   * @param input - The feedback body parameters (message and optional rating).
   * @returns A promise resolving to the created Feedback record.
   */
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
