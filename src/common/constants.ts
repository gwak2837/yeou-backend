export const NODE_ENV = process.env.NODE_ENV as string
export const PROJECT_ENV = (process.env.PROJECT_ENV ?? '') as string
export const K_SERVICE = process.env.K_SERVICE as string
export const PORT = (process.env.PORT ?? '3000') as string
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string
