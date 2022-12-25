import { Type } from '@sinclair/typebox'
import { load } from 'cheerio'
import fetch from 'node-fetch'

import { FLARE_LANE_API_KEY, FLARE_LANE_PROJECT_ID } from '../../common/constants'
import { BadRequestError, NotImplementedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import puppeteer from '../../common/puppeteer'
import { telegramBot } from '../../common/telegram'
import getCoupangProductInfo from './coupang'
import createNotification from './sql/createNotification.sql'
import { ISaveProductHistoryResult } from './sql/saveProductHistory'
import saveProductHistory from './sql/saveProductHistory.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  const schema = {
    querystring: Type.Object({
      url: Type.String(),
    }),
  }

  fastify.get('/product', { schema }, async (req) => {
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
    } = await (async () => {
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
    })()

    page.close()

    pool
      .query<ISaveProductHistoryResult>(saveProductHistory, [
        name,
        options.map((option) => option.value).join(','),
        imageUrl,
        productURL,
        isOutOfStock,
        minimumPrice,
      ])
      .then(async ({ rows }) => {
        for (const row of rows) {
          const rawCondition = row.condition

          if (rawCondition) {
            const condition = JSON.parse(rawCondition)
            if (!evaluate(condition)) continue
          }

          const title = `${name} % 하락`
          const content = `${minimumPrice}원 도달`

          // Web push
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
            console.log('👀 - result', result)

            if (result.data) {
              pool.query(createNotification, [title, content, result.data.id, productURL, 0])
            } else {
              console.error(result)
            }
          }

          // Telegram
          const telegramUserId = row.telegram_user_id

          if (row.should_notify_by_telegram && telegramUserId) {
            const a = await telegramBot.sendMessage(telegramUserId, `${title}\n\n${content}\n\n`)

            pool.query(createNotification, [title, content, a.message_id, productURL, 1])
          }
        }
      })
      .catch((reason) => console.error(reason))

    return {
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
    }
  })
}

function evaluate(condition: Record<string, any>) {
  return false
}
