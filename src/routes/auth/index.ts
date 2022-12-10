import { FastifyInstance } from 'fastify'

import { UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import authSQL from './sql/auth.sql'

export default async function routes(fastify: FastifyInstance, options: Record<string, unknown>) {
  fastify.get('/auth', async (request, reply) => {
    if (!request.user) throw UnauthorizedError('로그인 후 시도해주세요')

    // pool.query(authSQL, [request.user.id])

    return { hello: request.user }
  })

  fastify.get('/auth/get', async (request, reply) => {
    return { jwt: await reply.jwtSign({ id: 123 }) }
  })
}
