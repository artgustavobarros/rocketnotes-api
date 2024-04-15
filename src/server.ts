import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users.routes'
import { notesRoutes } from './routes/notes.routes'
import { tagsRoutes } from './routes/tags.routes'
import { sessionsRoutes } from './routes/sessions.routes'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'

const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: '10m' },
  cookie: { cookieName: 'refreshToken', signed: false },
})

app.register(cors, {})

app.register(fastifyCookie)
app.register(multipart)
app.register(usersRoutes)
app.register(notesRoutes)
app.register(tagsRoutes)
app.register(sessionsRoutes)

const PORT = env.PORT

app.listen({ port: PORT }).then(() => {
  console.log(`Server running on port ${PORT}`)
})
