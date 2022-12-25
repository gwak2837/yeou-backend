// 자동
export const NODE_ENV = process.env.NODE_ENV as string
export const K_SERVICE = process.env.K_SERVICE as string // GCP에서 실행 중일 때
export const PORT = (process.env.PORT ?? '4000') as string

// 공통
export const PROJECT_ENV = process.env.PROJECT_ENV as string
export const FRONTEND_URL = process.env.FRONTEND_URL as string
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string
// export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string
// export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string

// export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
// export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string
export const GOOGLE_CLOUD_STORAGE_BUCKET_NAME = process.env
  .GOOGLE_CLOUD_STORAGE_BUCKET_NAME as string
// export const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT as string
// export const GOOGLE_FIREBASE_API_KEY = process.env.GOOGLE_FIREBASE_API_KEY as string

export const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY as string
export const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY as string
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET as string

// export const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID as string
// export const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET as string

export const PGURI = process.env.PGURI as string

export const REDIS_CONNECTION_STRING = process.env.REDIS_CONNECTION_STRING as string

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string

export const FLARE_LANE_PROJECT_ID = process.env.FLARE_LANE_PROJECT_ID as string
export const FLARE_LANE_API_KEY = process.env.FLARE_LANE_API_KEY as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')
if (!FRONTEND_URL) throw new Error('`FRONTEND_URL` 환경 변수를 설정해주세요.')
if (!JWT_SECRET_KEY) throw new Error('`JWT_SECRET_KEY` 환경 변수를 설정해주세요.')

if (!GOOGLE_CLOUD_STORAGE_BUCKET_NAME)
  throw new Error('`GOOGLE_CLOUD_STORAGE_BUCKET_NAME` 환경 변수를 설정해주세요.')

if (!KAKAO_ADMIN_KEY) throw new Error('`KAKAO_ADMIN_KEY` 환경 변수를 설정해주세요.')
if (!KAKAO_REST_API_KEY) throw new Error('`KAKAO_REST_API_KEY` 환경 변수를 설정해주세요.')
if (!KAKAO_CLIENT_SECRET) throw new Error('`KAKAO_CLIENT_SECRET` 환경 변수를 설정해주세요.')

if (!PGURI) throw new Error('`PGURI` 환경 변수를 설정해주세요.')

if (!REDIS_CONNECTION_STRING) throw new Error('`REDIS_CONNECTION_STRING` 환경 변수를 설정해주세요.')

if (!TELEGRAM_BOT_TOKEN) throw new Error('`TELEGRAM_BOT_TOKEN` 환경 변수를 설정해주세요.')

if (!FLARE_LANE_PROJECT_ID) throw new Error('`FLARE_LANE_PROJECT_ID` 환경 변수를 설정해주세요.')
if (!FLARE_LANE_API_KEY) throw new Error('`FLARE_LANE_API_KEY` 환경 변수를 설정해주세요.')

// 개별
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string

export const POSTGRES_CA = process.env.POSTGRES_CA as string
export const POSTGRES_CERT = process.env.POSTGRES_CERT as string
export const POSTGRES_KEY = process.env.POSTGRES_KEY as string

export const REDIS_CA = process.env.REDIS_CA as string
export const REDIS_CLIENT_KEY = process.env.REDIS_CLIENT_KEY as string
export const REDIS_CLIENT_CERT = process.env.REDIS_CLIENT_CERT as string

if (PROJECT_ENV.startsWith('local')) {
  if (!LOCALHOST_HTTPS_KEY) throw new Error('`LOCALHOST_HTTPS_KEY` 환경 변수를 설정해주세요.')
  if (!LOCALHOST_HTTPS_CERT) throw new Error('`LOCALHOST_HTTPS_CERT` 환경 변수를 설정해주세요.')
}

if (PROJECT_ENV.startsWith('cloud') || PROJECT_ENV === 'local-prod') {
  if (!POSTGRES_CA) throw new Error('`POSTGRES_CA` 환경 변수를 설정해주세요.')
  if (!POSTGRES_CERT) throw new Error('`POSTGRES_CERT` 환경 변수를 설정해주세요.')
  if (!POSTGRES_KEY) throw new Error('`POSTGRES_KEY` 환경 변수를 설정해주세요.')

  if (!REDIS_CA) throw new Error('`REDIS_CA` 환경 변수를 설정해주세요.')
  if (!REDIS_CLIENT_KEY) throw new Error('`REDIS_CLIENT_KEY` 환경 변수를 설정해주세요.')
  if (!REDIS_CLIENT_CERT) throw new Error('`REDIS_CLIENT_CERT` 환경 변수를 설정해주세요.')
}
