// 자동
export const NODE_ENV = process.env.NODE_ENV as string
export const K_SERVICE = process.env.K_SERVICE as string // GCP에서 실행 중일 때
export const PORT = (process.env.PORT ?? '4000') as string

// 공통
export const PROJECT_ENV = (process.env.PROJECT_ENV ?? '') as string
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')
if (!JWT_SECRET_KEY) throw new Error('`JWT_SECRET_KEY` 환경 변수를 설정해주세요.')

// 개별
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string

if (PROJECT_ENV.startsWith('local')) {
  if (!LOCALHOST_HTTPS_KEY) throw new Error('`LOCALHOST_HTTPS_KEY` 환경 변수를 설정해주세요.')
  if (!LOCALHOST_HTTPS_CERT) throw new Error('`LOCALHOST_HTTPS_CERT` 환경 변수를 설정해주세요.')
}
