import { z } from 'zod'
import { NotesRepository } from '../repositories/notes-repository'
import { prisma } from '../lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Prisma } from '@prisma/client'

export class NoteController implements NotesRepository {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const requestBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      links: z.array(z.string()),
    })

    const { title, description, tags, links } = requestBodySchema.parse(
      request.body,
    )

    const user_id = Number(request.user.sub)

    const note = await prisma.note.create({
      data: { title, description, tags, links, user_id },
    })

    const { id } = note

    links.map(async (link) => {
      await prisma.link.create({
        data: {
          note_id: id,
          url: link,
        },
      })
    })

    tags.map(async (tag) => {
      await prisma.tag.create({
        data: {
          note_id: id,
          name: tag,
          user_id,
        },
      })
    })

    return reply.status(200).send('Note sucessfully created.')
  }

  async show(request: FastifyRequest, reply: FastifyReply) {
    const requestParamsSchema = z.object({
      id: z.coerce.number(),
    })

    const { id } = requestParamsSchema.parse(request.params)

    const note = await prisma.note.findUnique({ where: { id } })
    // se eu passar o note direto no send ele envia o resultado, se eu passar como objeto
    // ou seja {note} ele envia uma chave chamada note cujo valor é um objeto que contem o note.
    return reply.status(200).send(note)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const requestParamsSchema = z.object({
      id: z.coerce.number(),
    })

    const { id } = requestParamsSchema.parse(request.params)

    await prisma.note.delete({ where: { id } })

    return reply.status(200).send('Delete note sucessfully.')
  }

  async index(request: FastifyRequest, reply: FastifyReply) {
    const requestQuerySchema = z.object({
      title: z.string().optional(),
      tags: z.string().optional(),
    })

    const { title, tags } = requestQuerySchema.parse(request.query)

    const user_id = Number(request.user.sub)

    const arrTags = tags?.split(',').map((tag) => tag.trim())

    let notes: Prisma.NoteUncheckedCreateInput[]

    if (tags) {
      notes = await prisma.note.findMany({
        where: { tags: { hasSome: arrTags } },
      })
    } else {
      notes = await prisma.note.findMany({
        where: { user_id, title: { contains: title } },
      })
    }

    return reply.status(200).send(notes)
  }
}
