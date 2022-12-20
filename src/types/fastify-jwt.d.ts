import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Record<string, unknown>
    user: {
      id: number
      isFlareLane: boolean
      name?: string
      iat: number
      exp: number
    }
  }

  interface DecodePayloadType {
    user: {
      id: number
      name?: string
      iat: number
      exp: number
    }
  }
}
