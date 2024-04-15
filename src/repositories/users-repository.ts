import { FastifyReply, FastifyRequest } from 'fastify'

export interface UsersRepository {
  create(request: FastifyRequest, reply: FastifyReply): void
  update(request: FastifyRequest, reply: FastifyReply): void
  avatar(request: FastifyRequest, reply: FastifyReply): void
}
