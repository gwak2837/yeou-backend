// 자동
export const NODE_ENV = process.env.NODE_ENV as string
export const K_SERVICE = process.env.K_SERVICE as string // GCP에서 실행 중일 때
export const PORT = (process.env.PORT ?? '4000') as string

// 공통
export const PROJECT_ENV = (process.env.PROJECT_ENV ?? '') as string

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY as string
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY as string

export const PGURI = process.env.PGURI as string
export const POSTGRES_CA = process.env.POSTGRES_CA as string

export const REDIS_CONNECTION_STRING = process.env.REDIS_CONNECTION_STRING as string
export const REDIS_CA = process.env.REDIS_CA as string
export const REDIS_CLIENT_KEY = process.env.REDIS_CLIENT_KEY as string
export const REDIS_CLIENT_CERT = process.env.REDIS_CLIENT_CERT as string

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string
export const GOOGLE_CLOUD_STORAGE_BUCKET_NAME = process.env
  .GOOGLE_CLOUD_STORAGE_BUCKET_NAME as string
export const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT as string
export const GOOGLE_FIREBASE_API_KEY = process.env.GOOGLE_FIREBASE_API_KEY as string

export const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY as string
export const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY as string
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET as string

export const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID as string
export const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')

if (!JWT_SECRET_KEY) throw new Error('`JWT_SECRET_KEY` 환경 변수를 설정해주세요.')

// 개별
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string

if (PROJECT_ENV.startsWith('local')) {
  if (!LOCALHOST_HTTPS_KEY) throw new Error('`LOCALHOST_HTTPS_KEY` 환경 변수를 설정해주세요.')
  if (!LOCALHOST_HTTPS_CERT) throw new Error('`LOCALHOST_HTTPS_CERT` 환경 변수를 설정해주세요.')
}
