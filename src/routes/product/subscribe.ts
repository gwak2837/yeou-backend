import { Type } from '@sinclair/typebox'

import { pool } from '../../../database'
import { UnauthorizedError } from '../../common/fastify'
import { IToggleSubscriptionResult } from './sql/toggleSubscription'
import toggleSubscription from './sql/toggleSubscription.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  const schema = {
    params: Type.Object({
      id: Type.Number(),
    }),
  }

  fastify.post('/product/:id/subscribe', { schema }, async (req, reply) => {
    const user = req.user
    if (!user) throw UnauthorizedError('로그인 후 시도해주세요')

    const { rows } = await pool.query<IToggleSubscriptionResult>(toggleSubscription, [
      req.params.id,
      user.id,
    ])

    return { isSubscribed: rows[0].result }
  })
}
