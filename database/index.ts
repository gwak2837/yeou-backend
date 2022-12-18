import dotenv from 'dotenv'
import pg from 'pg'

const { Pool } = pg

// 환경 변수 설정
const env = process.argv[2]
export let CSV_PATH: string

if (env === 'prod') {
  dotenv.config()
  CSV_PATH = 'prod'
} else if (env === 'dev') {
  dotenv.config({ path: '.env.dev' })
  CSV_PATH = 'dev'
} else {
  dotenv.config({ path: '.env.local.dev' })
  CSV_PATH = 'local'
}

export const PROJECT_ENV = process.env.PROJECT_ENV as string
export const PGURI = process.env.PGURI as string
export const POSTGRES_CA = process.env.POSTGRES_CA as string
export const POSTGRES_CERT = process.env.POSTGRES_CERT as string
export const POSTGRES_KEY = process.env.POSTGRES_KEY as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')
if (!PGURI) throw new Error('`PGURI` 환경 변수를 설정해주세요.')

if (PROJECT_ENV.startsWith('cloud') || PROJECT_ENV === 'local-prod') {
  if (!POSTGRES_CA) throw new Error('`POSTGRES_CA` 환경 변수를 설정해주세요.')
  if (!POSTGRES_CERT) throw new Error('`POSTGRES_CERT` 환경 변수를 설정해주세요.')
  if (!POSTGRES_KEY) throw new Error('`POSTGRES_KEY` 환경 변수를 설정해주세요.')
}

console.log('👀 - process.env.PGURI', process.env.PGURI)

export const pool = new Pool({
  connectionString: PGURI,

  ...((PROJECT_ENV === 'cloud-dev' ||
    PROJECT_ENV === 'cloud-prod' ||
    PROJECT_ENV === 'local-prod') && {
    ssl: {
      ca: `-----BEGIN CERTIFICATE-----\n${POSTGRES_CA}\n-----END CERTIFICATE-----`,
      key: `-----BEGIN PRIVATE KEY-----\n${POSTGRES_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${POSTGRES_CERT}\n-----END CERTIFICATE-----`,
      checkServerIdentity: () => {
        return undefined
      },
    },
  }),
})
