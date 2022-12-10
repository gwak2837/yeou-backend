import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Record<string, unknown>
    user: {
      id: number
      name?: string
      iat: number
      exp: number
    }
  }
}
