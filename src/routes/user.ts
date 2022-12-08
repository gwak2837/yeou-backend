import { FastifyInstance } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: object) {
  fastify.get('/user', async (request, reply) => {
    if (!request.user) throw new Error('401')

    return { hello: 'world' }
  })
}
