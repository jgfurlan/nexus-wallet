import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Fastify preHandler guard that validates the Bearer JWT token from the Authorization header.
 * Extracts the token payload and attaches it to the request object as `request.user`.
 * 
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @throws {Reply} 401 Unauthorized if the token is missing, expired, or invalid.
 */
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
