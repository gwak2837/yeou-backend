import cors from '@fastify/cors'
import fastifyJWT from '@fastify/jwt'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
// import fastifySwagger from '@fastify/swagger'
// import fastifySwaggerUi from '@fastify/swagger-ui'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import Fastify from 'fastify'

import {
  JWT_SECRET_KEY,
  K_SERVICE,
  LOCALHOST_HTTPS_CERT,
  LOCALHOST_HTTPS_KEY,
  NODE_ENV,
  PORT,
  PROJECT_ENV,
} from '../common/constants'
import authRoute from './auth'
import authFlareLaneRoute from './auth/flare-lane'
import authGoogleRoute from './auth/google'
import authKakaoRoute from './auth/kakao'
import authNaverRoute from './auth/naver'
import notificationRoute from './notification'
import productRoute from './product'
import productSubscribeRoute from './product/subscribe'
import uploadRoute from './upload'
import userRoute from './user'

const fastify = Fastify({
  // logger: NODE_ENV === 'development',
  http2: true,

  ...(PROJECT_ENV.startsWith('local') && {
    https: {
      key: `-----BEGIN PRIVATE KEY-----\n${LOCALHOST_HTTPS_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${LOCALHOST_HTTPS_CERT}\n-----END CERTIFICATE-----`,
    },
  }),
}).withTypeProvider<TypeBoxTypeProvider>()

export type TFastify = typeof fastify

fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'https://yeou.app',
    'https://yeou.vercel.app',
    'https://yeou-git-dev-gwak2837.vercel.app',
    /^https:\/\/yeou-[a-z0-9]{1,20}-gwak2837\.vercel\.app/,
  ],
})

fastify.register(rateLimit, {
  ...(NODE_ENV === 'development' && {
    allowList: ['127.0.0.1'],
  }),
})

fastify.register(multipart, {
  limits: {
    fileSize: 10_000_000,
    fieldSize: 1_000,
    files: 10,
  },
})

fastify.register(fastifyJWT, {
  secret: JWT_SECRET_KEY,
  sign: {
    expiresIn: '3d',
  },
  verify: {
    algorithms: ['HS256'],
  },
})

type QuerystringJWT = {
  Querystring: {
    jwt?: string
  }
}

fastify.addHook<QuerystringJWT>('onRequest', async (request, reply) => {
  const jwt = request.headers.authorization ?? request.query.jwt
  if (!jwt) return

  request.headers.authorization = jwt

  try {
    await request.jwtVerify()
    // const verifiedJwt = await request.jwtVerify()
    // if (!verifiedJwt.iat) throw UnauthorizedError('다시 로그인 해주세요')

    // const logoutTime = await redisClient.get(`${verifiedJwt.userId}:logoutTime`)
    // if (Number(logoutTime) > Number(verifiedJwt.iat) * 1000)
    //   throw UnauthorizedError('다시 로그인 해주세요')
  } catch (err) {
    reply.send(err)
  }
})

// fastify.register(fastifySwagger, {
//   mode: 'dynamic',
//   openapi: {
//     info: {
//       title: 'String',
//       description: 'String',
//       version: 'String',
//     },
//   },
// })

// fastify.register(fastifySwaggerUi, {
//   routePrefix: '/documentation',
//   uiConfig: {
//     docExpansion: 'full',
//     deepLinking: false,
//   },
//   staticCSP: true,
// })

const schema = {
  schema: {
    querystring: Type.Object({
      foo: Type.Optional(Type.Number()),
      bar: Type.Optional(Type.String()),
    }),
    response: {
      200: Type.Object({
        hello: Type.String(),
        foo: Type.Optional(Type.Number()),
        bar: Type.Optional(Type.String()),
      }),
    },
  },
}

fastify.get('/', schema, async (request, _) => {
  const { foo, bar } = request.query
  return { hello: 'world', foo, bar }
})

fastify
  .register(authRoute)
  .register(authGoogleRoute)
  .register(authKakaoRoute)
  .register(authNaverRoute)
  .register(authFlareLaneRoute)
  .register(productRoute)
  .register(productSubscribeRoute)
  .register(uploadRoute)
  .register(userRoute)
  .register(notificationRoute)

export default async function startServer() {
  try {
    return await fastify.listen({
      port: +PORT,
      host: K_SERVICE || PROJECT_ENV === 'local-docker' ? '0.0.0.0' : 'localhost',
    })
  } catch (err) {
    console.error(err)
    throw new Error()
  }
}
