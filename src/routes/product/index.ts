import { Type } from '@sinclair/typebox'
import fetch from 'node-fetch'

import { FLARE_LANE_API_KEY, FLARE_LANE_PROJECT_ID } from '../../common/constants'
import { BadRequestError, NotImplementedError } from '../../common/fastify'
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
import updateSubscription from './sql/updateSubscription.sql'
import { TFastify } from '..'

type Condition = {
  prices: {
    limit: number
    fluctuation: 'more' | 'less'
    unit: number
  }[]
  hasCardDiscount: boolean
  hasCouponDiscount: boolean
  canBuy: boolean
}

export default async function routes(fastify: TFastify) {
  const schema = {
    querystring: Type.Object({
      url: Type.String(),
    }),
  }

  const browser = await puppeteer.browser

  fastify.get('/product', { schema }, async (req) => {
    const user = req.user

    let rawURL: URL
    try {
      rawURL = new URL(req.query.url)
    } catch (error) {
      throw BadRequestError('URL 형식이 잘못됐습니다')
    }

    const hostname = rawURL.hostname

    // TODO: 수익 링크로 전환하기

    switch (hostname) {
      case 'www.coupang.com':
      case 'link.coupang.com':
        for (const paramKey of rawURL.searchParams.keys()) {
          if (paramKey !== 'vendorItemId' && paramKey !== 'itemId') {
            rawURL.searchParams.delete(paramKey)
          }
        }
        break
      case 'ohou.se':
      case 'prod.danawa.com':
        throw NotImplementedError('지원 예정입니다')
      default:
        throw BadRequestError('지원하지 않는 URL 주소입니다')
    }

    rawURL.searchParams.sort()
    const productURL = rawURL.toString()

    const [{ rows }, productFromWeb] = await Promise.all([
      pool.query<IGetOrCreateProductResult>(getOrCreateProduct, [productURL, user?.id]),
      (async () => {
        switch (hostname) {
          case 'www.coupang.com':
          case 'link.coupang.com':
            return getCoupangProductInfo(browser, productURL)
          // case 'prod.danawa.com':
          //   return
          // case 'ohou.se':
          //   return
        }
      })(),
    ])

    const productFromDB = rows[0]
    const { condition, is_new: isNewProduct, product_id: productId } = productFromDB

    const {
      name,
      options,
      originalPrice,
      salePrice,
      couponPrice,
      cards,
      maximumCardDiscount,
      coupons,
      reward,
      maximumDiscount,
      minimumPrice,
      imageURL,
      reviewURL,
      reviewCount,
      isOutOfStock,
    } = productFromWeb

    // TODO: 아래 연속되는 pool.query 하나로 합치키
    if (isNewProduct) {
      pool.query(updateProduct, [name, options, imageURL, productId])
    }

    pool.query(saveProductHistory, [isOutOfStock, minimumPrice, productId])

    const oneHourBefore = new Date()
    oneHourBefore.setHours(oneHourBefore.getHours() - 1)

    pool
      .query<IGetProductSubscriptionsResult>(getProductSubscriptions, [
        productId,
        oneHourBefore, // 알림 간 최소 대기 시간
      ])
      .then(async ({ rows }) => {
        for (const row of rows) {
          const condition = row.condition ? (JSON.parse(row.condition) as Condition) : null
          if (!condition) continue
          if (!evaluate(condition, productFromWeb)) continue

          // TODO: 여러 condition 처리
          const firstCondition = condition.prices[0]
          const fluctuation = firstCondition.fluctuation === 'more' ? '상승' : '하락'
          const option = options.map((option) => option.value).join(', ')

          const title = `${name} ${firstCondition.limit}원 도달`
          const content = `${name} ${option} ${minimumPrice}원으로 ${fluctuation}`
          const channels = []
          let thirdPartyId

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
                imageURL,
                // data: {},
              }),
            })

            const result = (await response.json()) as Record<string, any>

            if (result.data) {
              thirdPartyId = result.data.id
              channels.push(0)
            } else {
              console.error(result)
            }
          }

          // Telegram notification
          const telegramUserId = row.telegram_user_id

          if (row.should_notify_by_telegram && telegramUserId) {
            const a = await telegramBot.sendMessage(telegramUserId, `${title}\n\n${content}\n\n`)

            if (a.message_id) {
              thirdPartyId = a.message_id
            } else {
              console.error(a)
            }
          }

          // Slack notification

          // TODO: 아래 update처럼, 모든 insert 한번에 하기
          pool.query(createNotification, [
            title,
            channels,
            content,
            thirdPartyId,
            productURL,
            row.id,
          ])
        }

        pool.query(updateSubscription, [productId])
      })
      .catch((reason) => console.error(reason))

    return {
      id: productId,
      name,
      options,
      URL: productURL,
      originalPrice,
      salePrice,
      couponPrice,
      cards,
      maximumCardDiscount,
      coupons,
      reward,
      maximumDiscount,
      minimumPrice,
      imageURL,
      reviewURL,
      reviewCount,
      isOutOfStock,
      notificationCondition: condition ? JSON.parse(condition) : null,
    }
  })
}

function evaluate(condition: Condition, productFromWeb: Record<string, any>) {
  const firstCondition = condition.prices[0]

  if (firstCondition.fluctuation === 'more') {
    return firstCondition.limit < productFromWeb.minimumPrice - firstCondition.unit
  } else {
    return firstCondition.limit > productFromWeb.minimumPrice + firstCondition.unit
  }
}
