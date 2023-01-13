import { Type } from '@sinclair/typebox'
import fetch from 'node-fetch'

import { FLARE_LANE_API_KEY, FLARE_LANE_PROJECT_ID } from '../../common/constants'
import { BadRequestError, NotImplementedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import puppeteer from '../../common/puppeteer'
import { telegramBot } from '../../common/telegram'
import { formatKRPrice } from '../../common/utils'
import getCoupangProductInfo from './coupang'
import createNotification from './sql/createNotification.sql'
import createProductHistory from './sql/createProductHistory.sql'
import { IGetOrCreateProductResult } from './sql/getOrCreateProduct'
import getOrCreateProduct from './sql/getOrCreateProduct.sql'
import { IGetProductSubscriptionsResult } from './sql/getProductSubscriptions'
import getProductSubscriptions from './sql/getProductSubscriptions.sql'
import updateProduct from './sql/updateProduct.sql'
import updateSubscription from './sql/updateSubscription.sql'
import { TFastify } from '..'

type Price = {
  limit: number
  fluctuation: '상승' | '하락'
  unit: number
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

    if (hostname === 'www.coupang.com') {
      const searchParams = new URLSearchParams(rawURL.search)
      const newSearchParams: any = {}
      const venderItemId = searchParams.get('vendorItemId')
      const itemId = searchParams.get('itemId')
      if (venderItemId) newSearchParams.vendorItemId = venderItemId
      if (itemId) newSearchParams.itemId = itemId
      rawURL.search = new URLSearchParams(newSearchParams).toString()
    } else if (hostname === 'link.coupang.com') {
      rawURL.search = ''
    } else if (hostname === 'ohou.se') {
      throw NotImplementedError('지원 예정입니다')
    } else if (hostname === 'prod.danawa.com') {
      throw NotImplementedError('지원 예정입니다')
    } else {
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
    const {
      prices,
      has_card_discount: hasCardDiscount,
      has_coupon_discount: hasCouponDiscount,
      can_buy: canBuy,
      is_new: isNewProduct,
      product_id: productId,
    } = productFromDB

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

    const now = new Date()
    pool.query(createProductHistory, [now, isOutOfStock, minimumPrice, productId]) // has_card_discount has_coupon_discount 반영하기

    const oneHourBefore = new Date()
    oneHourBefore.setHours(oneHourBefore.getHours() - 1)

    pool
      .query<IGetProductSubscriptionsResult>(getProductSubscriptions, [
        productId,
        oneHourBefore, // 알림 간 최소 대기 시간
      ])
      .then(async ({ rows }) => {
        for (const row of rows) {
          const prices = row.prices ? (JSON.parse(row.prices) as Price[]) : null
          const titles = new Set()
          const contents = []

          if (prices) {
            for (const price of prices) {
              const isSatisfiedPriceCondition =
                (price.fluctuation === '상승' &&
                  row.product_history__price &&
                  row.product_history__price < price.limit &&
                  minimumPrice > price.limit) ||
                (price.fluctuation === '하락' &&
                  row.product_history__price &&
                  row.product_history__price > price.limit &&
                  minimumPrice < price.limit)

              if (isSatisfiedPriceCondition) {
                titles.add('가격 변동')
                contents.push(
                  `상품 가격이 ${formatKRPrice(price.limit)}원 보다 ${price.fluctuation}했습니다.`
                )
              }
            }
          }

          if (row.can_buy && row.is_out_of_stock && !isOutOfStock) {
            titles.add('재입고')
            contents.push('상품이 재입고됐습니다.')
          }

          if (row.condition__card_discount && !row.has_card_discount && cards) {
            titles.add('카드 할인')
            contents.push('상품에 카드 할인이 생겼습니다.')
          }

          if (row.condition__coupon_discount && !row.has_coupon_discount && coupons) {
            titles.add('쿠폰 할인')
            contents.push('상품에 쿠폰 할인이 생겼습니다.')
          }

          const option = options.map((option) => option.value).join(', ')
          const title = `${name} ${option} ${Array.from(titles).join(', ')}`
          const content = `${contents.join('\n\n')}`

          const channels = []
          let thirdPartyMessageId

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
              thirdPartyMessageId = result.data.id
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
              thirdPartyMessageId = a.message_id
            } else {
              console.error(a)
            }
          }

          // Slack notification

          // Discord notification

          // Twitter notification

          // TODO: 아래 update처럼, 모든 insert 한번에 하기
          pool.query(createNotification, [
            title,
            channels,
            content,
            thirdPartyMessageId,
            productURL,
            row.id,
          ])
        }

        pool.query(updateSubscription, [productId])
      })
      .catch((reason) => console.error(reason))

    return {
      id: productId,
      updateTime: now,
      name,
      options,
      URL: productURL,
      affiliateLink: productURL,
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
      notificationCondition: {
        prices: prices ? JSON.parse(prices) : null,
        hasCardDiscount,
        hasCouponDiscount,
        canBuy,
      },
    }
  })
}
