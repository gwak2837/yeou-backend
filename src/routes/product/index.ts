import { Type } from '@sinclair/typebox'
import fetch from 'node-fetch'

import { FLARE_LANE_API_KEY, FLARE_LANE_PROJECT_ID } from '../../common/constants'
import { BadRequestError, NotImplementedError, UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import puppeteer from '../../common/puppeteer'
import { telegramBot } from '../../common/telegram'
import getCoupangProductInfo from './coupang'
import createNotification from './sql/createNotification.sql'
import { IGetOrCreateProductResult } from './sql/getOrCreateProduct'
import getOrCreateProduct from './sql/getOrCreateProduct.sql'
import { IGetProductSubscriptionsResult } from './sql/getProductSubscriptions'
import getProductSubscriptions from './sql/getProductSubscriptions.sql'
import saveProductHistory from './sql/saveProductHistory.sql'
import updateProduct from './sql/updateProduct.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  const schema = {
    querystring: Type.Object({
      url: Type.String(),
    }),
  }

  fastify.get('/product', { schema }, async (req) => {
    const user = req.user
    if (!user) throw UnauthorizedError('로그인 후 시도해주세요')

    let rawURL
    try {
      rawURL = new URL(req.query.url)
    } catch (error) {
      throw BadRequestError('URL 형식이 잘못됐습니다')
    }

    rawURL.searchParams.sort()
    const productURL = rawURL.toString()
    const hostname = rawURL.hostname

    const page = await (await puppeteer.browser).newPage()
    try {
      await page.goto(productURL)
    } catch (err) {
      throw BadRequestError('해당 URL 접속에 실패했습니다')
    }

    const [{ rows }, productFromWeb] = await Promise.all([
      pool.query<IGetOrCreateProductResult>(getOrCreateProduct, [productURL, user.id]),
      (async () => {
        switch (hostname) {
          case 'www.coupang.com':
          case 'link.coupang.com':
            return getCoupangProductInfo(page)
          case 'prod.danawa.com':
          case 'ohou.se':
            throw NotImplementedError('지원 예정입니다')
          default:
            throw BadRequestError('지원하지 않는 URL 주소입니다')
        }
      })(),
    ])

    page.close()

    const productFromDB = rows[0]

    const {
      name,
      options,
      originalPrice,
      salePrice,
      couponPrice,
      coupon,
      creditCard,
      reward,
      imageUrl,
      reviewCount,
      isOutOfStock,
      minimumPrice,
    } = productFromWeb

    if (productFromDB.is_new) {
      pool.query(updateProduct, [name, options, imageUrl, productFromDB.product_id])
    }

    pool.query(saveProductHistory, [isOutOfStock, minimumPrice, productFromDB.product_id])

    pool
      .query<IGetProductSubscriptionsResult>(getProductSubscriptions, [productFromDB.product_id])
      .then(async ({ rows }) => {
        for (const row of rows) {
          const rawCondition = row.condition

          if (rawCondition) {
            const condition = JSON.parse(rawCondition)
            if (!evaluate(condition)) continue
          }

          const title = `${name} % 하락`
          const content = `${minimumPrice}원 도달`

          // Web push notification
          const flareLaneDeviceId = row.flare_lane_device_id

          if (row.should_notify_by_web_push && flareLaneDeviceId) {
            const flareLanePushURL = `https://api.flarelane.com/v1/projects/${FLARE_LANE_PROJECT_ID}/notifications`
            const response = await fetch(flareLanePushURL, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${FLARE_LANE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                targetType: 'device',
                targetIds: [flareLaneDeviceId],
                title,
                body: content,
                url: productURL,
                imageUrl,
                // data: {},
              }),
            })

            const result = (await response.json()) as Record<string, any>

            if (result.data) {
              pool.query(createNotification, [
                title,
                content,
                result.data.id,
                productURL,
                0,
                user.id,
              ])
            } else {
              console.error(result)
            }
          }

          // Telegram notification
          const telegramUserId = row.telegram_user_id

          if (row.should_notify_by_telegram && telegramUserId) {
            const a = await telegramBot.sendMessage(telegramUserId, `${title}\n\n${content}\n\n`)

            pool.query(createNotification, [title, content, a.message_id, productURL, 1, user.id])
          }
        }
      })
      .catch((reason) => console.error(reason))

    return {
      id: productFromDB.product_id,
      name,
      options,
      originalPrice,
      salePrice,
      couponPrice,
      reward,
      minimumPrice,
      coupon,
      creditCard,
      imageUrl,
      reviewCount,
      isOutOfStock,
      isSubscribed: productFromDB.is_subscribed !== null,
    }
  })
}

function evaluate(condition: Record<string, any>) {
  return condition.send
}
