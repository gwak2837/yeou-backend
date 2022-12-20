import createError from '@fastify/error'

export const BadRequestError = createError('400_BAD_REQUEST', '%s', 400)
export const UnauthorizedError = createError('401_UNAUTHORIZED', '%s', 401)
export const ForbiddenError = createError('402_FORBIDDEN', '%s', 403)
export const NotFoundError = createError('404_NOT_FOUND', '%s', 404)

export const InternalServerError = createError('500_INTERNAL_SERVER_ERROR', '%s', 500)
export const NotImplementedError = createError('501_NOT_IMPLEMENTED_ERROR', '%s', 501)
export const BadGatewayError = createError('502_BAD_GATEWAY', '%s', 502)
export const ServiceUnavailableError = createError('503_SERVICE_UNAVAILABLE', '%s', 503)
