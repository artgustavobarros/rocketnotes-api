import { FastifyInstance } from 'fastify'
import { TagController } from '../controllers/TagController'
import { ensureAuthenticated } from '../middlewares/ensure-authenticated'

const tagsController = new TagController()

export const tagsRoutes = async (app: FastifyInstance) => {
  app.get('/tags', { onRequest: ensureAuthenticated }, tagsController.index)
}
