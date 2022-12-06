import Fastify from 'fastify'

import { NODE_ENV } from '../common/constants'
import productRoute from './product'
import userRoute from './user'

const fastify = Fastify({
  logger: NODE_ENV === 'production',
  http2: true,
})

fastify.register(productRoute)
fastify.register(userRoute)

export default async function startServer() {
  try {
    await fastify.listen({ port: 3000, host: process.env.K_SERVICE ? '0.0.0.0' : 'localhost' })
  } catch (err) {
    fastify.log.error(err)
    throw new Error()
  }
}
