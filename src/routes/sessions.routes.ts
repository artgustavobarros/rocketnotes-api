import { FastifyInstance } from 'fastify'
import { SessionsController } from '../controllers/SessionsController'

const sessionsController = new SessionsController()

export const sessionsRoutes = async (app: FastifyInstance) => {
  app.post('/sessions', sessionsController.create)
}
