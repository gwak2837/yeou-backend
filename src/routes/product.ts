import { FastifyInstance } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: Record<string, unknown>) {
  fastify.get('/product', async (request, reply) => {
    return { hello: 'product' }
  })
}
