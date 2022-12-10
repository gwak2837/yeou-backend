import pg from 'pg'

import { PGURI, POSTGRES_CA, POSTGRES_CERT, POSTGRES_KEY, PROJECT_ENV } from '../common/constants'

const { Pool } = pg

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
