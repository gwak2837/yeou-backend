import { Type } from '@sinclair/typebox'

import { pool } from '../../common/postgres'
import { IGetFlareLaneUserResult } from './sql/getFlareLaneUser'
import getFlareLaneUser from './sql/getFlareLaneUser.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  const schema = {
    headers: Type.Object({
      'device-id': Type.String({ format: 'uuid' }),
    }),
  }

  fastify.get('/auth/flare-lane', { schema }, async (req, reply) => {
    const deviceId = req.headers['device-id']

    const { rows } = await pool.query<IGetFlareLaneUserResult>(getFlareLaneUser, [deviceId])

    return { jwt: await reply.jwtSign({ id: rows[0].user_id, isFlareLane: true }) }
  })
}
