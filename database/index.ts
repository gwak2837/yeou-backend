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
  dotenv.config({ path: '.env.development' })
  CSV_PATH = 'dev'
} else {
  dotenv.config({ path: '.env.development.local' })
  CSV_PATH = 'local'
}

const PROJECT_ENV = process.env.PROJECT_ENV as string
const PGURI = process.env.PGURI as string
const POSTGRES_CA = process.env.POSTGRES_CA as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')
if (!PGURI) throw new Error('`PGURI` 환경 변수를 설정해주세요.')
if (!POSTGRES_CA) throw new Error('`POSTGRES_CA` 환경 변수를 설정해주세요.')

console.log(PGURI)

// PostgreSQL 서버 연결
export const pool = new Pool({
  connectionString: PGURI,

  ...((PROJECT_ENV === 'cloud-dev' ||
    PROJECT_ENV === 'cloud-prod' ||
    PROJECT_ENV === 'local-prod') && {
    ssl: {
      ca: `-----BEGIN CERTIFICATE-----\n${POSTGRES_CA}\n-----END CERTIFICATE-----`,
      checkServerIdentity: () => {
        return undefined
      },
    },
  }),
})
