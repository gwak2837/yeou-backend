import { UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import { IGetNotificationsResult } from './sql/getNotifications'
import getNotifications from './sql/getNotifications.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  fastify.get('/notification', async (req) => {
    const user = req.user

    if (!user) throw UnauthorizedError('로그인 후 시도해주세요')

    const { rows } = await pool.query<IGetNotificationsResult>(getNotifications, [user.id])

    return rows.map((row) => ({
      id: row.id,
      creationTime: row.creation_time,
      name: row.name,
      option: row.option,
      imageURL: row.image_url,
    }))
  })
}
