import { createClient } from 'redis'

import {
  PROJECT_ENV,
  REDIS_CA,
  REDIS_CLIENT_CERT,
  REDIS_CLIENT_KEY,
  REDIS_CONNECTION_STRING,
} from '../common/constants'

export const redisClient = createClient({
  url: REDIS_CONNECTION_STRING,

  ...((PROJECT_ENV === 'cloud-dev' ||
    PROJECT_ENV === 'cloud-prod' ||
    PROJECT_ENV === 'local-docker') && {
    socket: {
      tls: true,
      ca: `-----BEGIN CERTIFICATE-----\n${REDIS_CA}\n-----END CERTIFICATE-----`,
      key: `-----BEGIN PRIVATE KEY-----\n${REDIS_CLIENT_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${REDIS_CLIENT_CERT}\n-----END CERTIFICATE-----`,
      checkServerIdentity: () => {
        return undefined
      },
      reconnectStrategy: (retries) => Math.min(retries * 1000, 15_000),
    },
  }),
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))

export async function startRedisClient() {
  await redisClient.connect()
  return redisClient.time()
}
