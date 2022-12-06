import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'

import {
  K_SERVICE,
  LOCALHOST_HTTPS_CERT,
  LOCALHOST_HTTPS_KEY,
  NODE_ENV,
  PORT,
  PROJECT_ENV,
} from '../common/constants'
import productRoute from './product'
import userRoute from './user'

const fastify = Fastify({
  logger: NODE_ENV === 'production',
  http2: true,

  ...(PROJECT_ENV.startsWith('local') && {
    https: {
      key: `-----BEGIN PRIVATE KEY-----\n${LOCALHOST_HTTPS_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${LOCALHOST_HTTPS_CERT}\n-----END CERTIFICATE-----`,
    },
  }),
})

fastify.register(productRoute)
fastify.register(userRoute)

export default async function startServer() {
  await fastify.register(cors, {
    origin: [
      'http://localhost:3000',
      'https://coopang.app',
      'https://coopang.vercel.app',
      'https://coopang-git-dev-gwak2837.vercel.app',
      /^https:\/\/coopang-[a-z0-9]{1,20}-gwak2837\.vercel\.app/,
    ],
  })

  await fastify.register(rateLimit, {
    ...(NODE_ENV === 'development' && {
      allowList: ['127.0.0.1'],
    }),
  })

  await fastify.register(fastifySwagger, {
    mode: 'dynamic',
    openapi: {
      info: {
        title: 'String',
        description: 'String',
        version: 'String',
      },
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
  })

  try {
    await fastify.listen({ port: +PORT, host: K_SERVICE ? '0.0.0.0' : 'localhost' })
  } catch (err) {
    fastify.log.error(err)
    throw new Error()
  }
}
