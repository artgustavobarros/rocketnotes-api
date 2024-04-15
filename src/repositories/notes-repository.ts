import { FastifyReply, FastifyRequest } from 'fastify'

export interface NotesRepository {
  create(request: FastifyRequest, reply: FastifyReply): void
  show(request: FastifyRequest, reply: FastifyReply): void
  delete(request: FastifyRequest, reply: FastifyReply): void
  index(request: FastifyRequest, reply: FastifyReply): void
}
