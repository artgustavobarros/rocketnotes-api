// import '@fastify/jwt'

// declare module '@fastify/jwt' {
//   export interface fastifyJWT {
//     user: {
//       sub: string
//     }
//   }
// }

// fastify-jwt.d.ts
import '@fastify/jwt'

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      sub: string
    } // user type is return type of `request.user` object
  }
}
