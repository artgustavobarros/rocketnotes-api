import { FastifyReply, FastifyRequest } from 'fastify'
import { TagsRepository } from '../repositories/tags-repository'
import { prisma } from '../lib/prisma'

export class TagController implements TagsRepository {
  async index(request: FastifyRequest, reply: FastifyReply) {
    const tags = await prisma.tag.groupBy({ by: 'name' })

    return reply.status(200).send(tags)
  }
}
