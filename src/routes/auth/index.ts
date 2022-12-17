import { Type } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'

import { UnauthorizedError } from '../../common/fastify'

export default async function routes(fastify: FastifyInstance, options: Record<string, unknown>) {
  fastify.get('/auth', async (request, reply) => {
    const user = request.user

    if (!user) throw UnauthorizedError('로그인 후 시도해주세요')

    return {
      userId: user.id,
      username: user.name,
    }
  })

  fastify.get('/auth/jwt', async (request, reply) => {
    return { jwt: await reply.jwtSign({ id: 0, name: 'test' }) }
  })
}

export const querystringCode = {
  schema: {
    querystring: Type.Object({
      code: Type.String(),
    }),
  },
}

export const querystringCodeState = {
  schema: {
    querystring: Type.Object({
      code: Type.String(),
      state: Type.String(),
    }),
  },
}
