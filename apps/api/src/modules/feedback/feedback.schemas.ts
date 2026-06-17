import { z } from 'zod';

export const CreateFeedbackInputSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória').max(2000, 'Mensagem muito longa'),
  rating: z.number().int().min(1).max(5).optional(),
});

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackInputSchema>;

export const FeedbackResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  rating: z.number().nullable(),
  createdAt: z.string(),
});

export type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;
