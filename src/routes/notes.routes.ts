import { FastifyInstance } from 'fastify'
import { NoteController } from '../controllers/NoteController'
import { ensureAuthenticated } from '../middlewares/ensure-authenticated'

const notesController = new NoteController()

export const notesRoutes = async (app: FastifyInstance) => {
  app.addHook('onRequest', ensureAuthenticated)
  app.post('/notes', notesController.create)
  app.delete('/notes/:id', notesController.delete)
  app.get('/notes/:id', notesController.show)
  app.get('/notes', notesController.index)
}
