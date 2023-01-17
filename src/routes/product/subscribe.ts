import { Type } from '@sinclair/typebox'

import { UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import { IToggleSubscriptionResult } from './sql/toggleSubscription'
import toggleSubscription from './sql/toggleSubscription.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  const schema = {
    params: Type.Object({
      id: Type.Number(),
    }),
    body: Type.Union([
      Type.Object({
        prices: Type.Union([
          Type.Array(
            Type.Object({
              limit: Type.Number(),
              fluctuation: Type.Union([Type.Literal('상승'), Type.Literal('하락')]),
              unit: Type.Number(),
            })
          ),
          Type.Null(),
        ]),
        hasCardDiscount: Type.Boolean(),
        hasCouponDiscount: Type.Boolean(),
        canBuy: Type.Boolean(),
      }),
      Type.Null(),
    ]),
  }

  fastify.post('/product/:id/subscribe', { schema }, async (req) => {
    const user = req.user
    if (!user) throw UnauthorizedError('로그인 후 시도해주세요')

    const body = req.body
    const prices = body?.prices

    const { rows } = await pool.query<IToggleSubscriptionResult>(toggleSubscription, [
      req.params.id,
      user.id,
      prices && prices.length > 0 ? prices : null,
      body?.hasCardDiscount ?? false,
      body?.hasCouponDiscount ?? false,
      body?.canBuy ?? false,
    ])

    return { isSubscribed: rows[0].result }
  })
}
