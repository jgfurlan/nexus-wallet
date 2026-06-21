import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Fastify preHandler guard that validates the JWT token from the HttpOnly cookie `nexus_token`.
 * The `@fastify/jwt` plugin is configured with `cookie.cookieName: 'nexus_token'`,
 * so `request.jwtVerify()` automatically extracts the token from the cookie.
 * Attaches the decoded token payload to `request.user`.
 * 
 * @param request - The Fastify request object.
 * @param reply - The Fastify reply object.
 * @throws {Reply} 401 Unauthorized if the cookie is missing, expired, or the token is invalid.
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
