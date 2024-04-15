import { FastifyReply, FastifyRequest } from 'fastify'

export interface TagsRepository {
  index(request: FastifyRequest, reply: FastifyReply): void
}
