import { FastifyInstance } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: object) {
  fastify.get('/product', async (request, reply) => {
    return { hello: 'world' }
  })
}
