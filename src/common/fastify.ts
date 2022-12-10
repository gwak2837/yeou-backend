import createError from '@fastify/error'

export const BadRequestError = createError('400_BAD_REQUEST', 'Error: %s', 400)
export const UnauthorizedError = createError('401_UNAUTHORIZED', 'Error: %s', 401)
export const ForbiddenError = createError('402_FORBIDDEN', 'Error: %s', 403)
export const NotFoundError = createError('404_NOT_FOUND', 'Error: %s', 404)

export const InternalServerError = createError('500_INTERNAL_SERVER_ERROR', 'Error: %s', 500)
export const NotImplementedError = createError('501_NOT_IMPLEMENTED_ERROR', 'Error: %s', 501)
export const BadGatewayError = createError('502_BAD_GATEWAY', 'Error: %s', 502)
export const ServiceUnavailableError = createError('503_SERVICE_UNAVAILABLE', 'Error: %s', 503)
