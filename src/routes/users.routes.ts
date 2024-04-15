import { FastifyInstance } from 'fastify'
import { UsersController } from '../controllers/UserController'
import { ensureAuthenticated } from '../middlewares/ensure-authenticated'

const usersController = new UsersController()

// sem o async o server não rodou os paths
export const usersRoutes = async (app: FastifyInstance) => {
  // no lugar de onRequest utilizamos o preValidation, pois nos outros o request.body viria
  // undefined segundo a documentação, pois viria em formato de stream.
  app.post('/users', usersController.create)
  app.put(
    '/users',
    { onRequest: [ensureAuthenticated] },
    usersController.update,
  )
  app.patch(
    '/users/avatar',
    { onRequest: [ensureAuthenticated] },
    usersController.avatar,
  )
  app.get('/file/:id', usersController.showAvatar)
}
