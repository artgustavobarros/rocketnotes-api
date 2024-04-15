import { FastifyReply, FastifyRequest } from 'fastify'
import { UsersRepository } from '../repositories/users-repository'
import { ZodError, z } from 'zod'
import { prisma } from '../lib/prisma'
import { UserAlreadyExistsError } from '../utils/error/user-already-exists-error'
import { compare, hash } from 'bcryptjs'
import { InvalidCredentialsError } from '../utils/error/invalid-credentials-error'
import { ChangePasswordError } from '../utils/error/change-password-error'
import util from 'util'
import { Readable, pipeline } from 'stream'
import fs from 'fs'
import { ReadableStream } from 'node:stream/web'
import { error } from 'console'
import { MultipartFile } from '@fastify/multipart'
import { InvalidAvatarError } from '../utils/error/user-already-exists-error copy'

const pump = util.promisify(pipeline)

export class UsersController implements UsersRepository {
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const createBodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })

      const { name, email, password } = createBodySchema.parse(request.body)

      const checkUserWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (checkUserWithSameEmail) {
        throw new UserAlreadyExistsError()
      }

      const password_hash = await hash(password, 8)

      await prisma.user.create({
        data: { name, email, password_hash },
      })

      return reply.status(201).send('Created user.')
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(409).send('Invalid credentials')
      }
      throw err
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const requestBodySchema = z.object({
      name: z.string().optional(),
      password: z.string().optional(),
      email: z.string().optional(),
      old_password: z.string().optional(),
    })

    const { name, password, email, old_password } = requestBodySchema.parse(
      request.body,
    )

    const id = Number(request.user.sub)

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserAlreadyExistsError()
      }
    }

    if (password && !old_password) {
      throw new ChangePasswordError()
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password_hash)

      if (!checkOldPassword) {
        throw new ChangePasswordError()
      }

      user.password_hash = await hash(password, 8)
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        email: email ?? user.email,
        password_hash: user.password_hash,
        updated_at: new Date(),
      },
    })

    return reply.status(200).send(user)
  }

  async avatar(request: FastifyRequest, reply: FastifyReply) {
    const data: MultipartFile = await request.file()

    const { filename } = data

    const hashedFilename = `${crypto.randomUUID()}-${filename}`

    const tempPath = fs.createWriteStream(`src/temp/${hashedFilename}`)

    await pump(data.file, tempPath)

    const id = request.user.sub

    const user_id = Number(id)

    const user = await prisma.user.findUnique({ where: { id: user_id } })

    const { avatar } = user

    if (avatar) {
      fs.promises.unlink(`src/temp/${avatar}`)
    }

    if (!user) {
      throw new InvalidCredentialsError()
    }

    await prisma.user.update({
      where: { id: user_id },
      data: {
        avatar: hashedFilename,
      },
    })

    return reply.status(201).send(avatar)
  }

  async showAvatar(request: FastifyRequest, reply: FastifyReply) {
    const requestParamasSchema = z.object({
      id: z.string(),
    })

    const { id } = requestParamasSchema.parse(request.params)

    if (id) {
      const buffer = fs.readFileSync(`src/temp/${id}`)
      const myStream = new Readable({
        read() {
          this.push(buffer)
          this.push(null)
        },
      })

      reply.type('image/png')
      reply.send(myStream)
    }
  }
}
