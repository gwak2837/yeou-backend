import { Type } from '@sinclair/typebox'

import { pool } from '../../common/postgres'
import { IGetProductHistoryResult } from './sql/getProductHistory'
import getProductHistory from './sql/getProductHistory.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify, options: Record<string, unknown>) {
  const schema = {
    params: Type.Object({
      id: Type.Number(),
    }),
  }

  fastify.get('/product/:id/history', { schema }, async (req) => {
    const { rows } = await pool.query<IGetProductHistoryResult>(getProductHistory, [req.params.id])

    return rows
  })
}
