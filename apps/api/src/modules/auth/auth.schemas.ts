import { z } from 'zod';

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RefreshInputSchema = z.object({
  refreshToken: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type RefreshInput = z.infer<typeof RefreshInputSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
