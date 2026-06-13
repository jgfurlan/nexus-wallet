import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { prisma } from '../../lib/prisma';
import { RegisterInput, LoginInput } from './auth.schemas';
import { FastifyInstance } from 'fastify';

// Helper to calculate SHA256 hash of a string
const hashSHA256 = (data: string): string => {
  return createHash('sha256').update(data).digest('hex');
};

export class AuthService {
  static async registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw Object.assign(new Error('Email already exists'), {
        statusCode: 409,
        name: 'Conflict',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Create User, Wallet, and WalletBalances in a single transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: newUser.id,
        },
      });

      await tx.walletBalance.createMany({
        data: [
          { walletId: wallet.id, token: 'BRL', amount: 0 },
          { walletId: wallet.id, token: 'BTC', amount: 0 },
          { walletId: wallet.id, token: 'ETH', amount: 0 },
        ],
      });

      return newUser;
    });

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  static async loginUser(app: FastifyInstance, input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      throw Object.assign(new Error('Invalid email or password'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate JWT access token (15m)
    const accessToken = app.jwt.sign(
      { email: user.email, signup: false, sub: user.id },
      { expiresIn: '15m' }
    );

    // Generate Refresh Token JWT (7d)
    const refreshToken = app.jwt.sign(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      { expiresIn: '7d' }
    );

    const refreshTokenHash = hashSHA256(refreshToken);

    // Save refresh token hash to database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  static async refreshSession(app: FastifyInstance, refreshToken: string) {
    let payload: { sub?: string; type?: string };
    try {
      payload = app.jwt.verify(refreshToken);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    if (!payload.sub || payload.type !== 'refresh') {
      throw Object.assign(new Error('Invalid refresh token payload'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const userId = payload.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const inputHash = hashSHA256(refreshToken);

    // Reuse detection
    if (!user.refreshToken || user.refreshToken !== inputHash) {
      // Stolen token reuse detected: revoke all sessions
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      throw Object.assign(new Error('Refresh token reuse detected. Revoking all sessions.'), {
        statusCode: 401,
        name: 'Unauthorized',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Generate new par of tokens
    const accessToken = app.jwt.sign(
      { email: user.email, signup: false, sub: user.id },
      { expiresIn: '15m' }
    );

    const newRefreshToken = app.jwt.sign(
      { sub: user.id, type: 'refresh', jti: randomUUID() },
      { expiresIn: '7d' }
    );

    const newHash = hashSHA256(newRefreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newHash },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
