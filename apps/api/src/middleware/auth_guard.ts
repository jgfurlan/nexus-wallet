import { FastifyReply, FastifyRequest } from 'fastify';

export const authGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid token',
    });
  }
};
