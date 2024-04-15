import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { InvalidCredentialsError } from '../utils/error/invalid-credentials-error'
import { compare } from 'bcryptjs'

export class SessionsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const requestBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = requestBodySchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatch = await compare(password, user.password_hash)

    if (!passwordMatch) {
      throw new InvalidCredentialsError()
    }

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: String(user.id),
        },
      },
    )

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: String(user.id),
          expiresIn: '1d',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ user, token })
  }
}
