import { UnauthorizedError } from '../../common/fastify'
import { TFastify } from '..'

export default async function routes(fastify: TFastify, options: Record<string, unknown>) {
  fastify.get('/notification', async (request, reply) => {
    if (!request.user) throw UnauthorizedError('로그인 후 시도해주세요')

    return { hello: 'index' }
  })
}
