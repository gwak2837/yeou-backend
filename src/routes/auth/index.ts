import { Type } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'

import { UnauthorizedError } from '../../common/fastify'

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/auth', async (request) => {
    const user = request.user

    if (!user) return null

    return {
      userId: user.id,
      username: user.name,
      isFlareLane: user.isFlareLane,
    }
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
