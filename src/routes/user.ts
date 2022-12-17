import { FastifyInstance } from 'fastify'

import { UnauthorizedError } from '../common/fastify'

export default async function routes(fastify: FastifyInstance, options: object) {
  fastify.get('/user', async (request, reply) => {
    if (!request.user) throw UnauthorizedError('')

    return { hello: 'world' }
  })
}
