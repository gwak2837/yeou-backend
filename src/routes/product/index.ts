import { Type } from '@sinclair/typebox'
import { load } from 'cheerio'
import fetch from 'node-fetch'

import { FLARE_LANE_API_KEY, FLARE_LANE_PROJECT_ID } from '../../common/constants'
import { BadGatewayError, BadRequestError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import puppeteer from '../../common/puppeteer'
import { telegramBot } from '../../common/telegram'
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

    // 페이지 이동
    const page = await (await puppeteer.browser).newPage()
    // 쿠팡 로그인 await page.goto('https://login.coupang.com/login/login.pang')
    try {
      await page.goto(productURL)
    } catch (err) {
      throw BadRequestError('해당 URL 접속에 실패했습니다')
    }

    // 쿠팡 접속 대기
    await page.waitForSelector('.prod-coupon-download-btn')
    const getStyle = 'document.querySelector(".prod-coupon-download-btn").getAttribute("style")'
    const couponButtonStyle = await page.evaluate(getStyle)
    if (couponButtonStyle !== 'display: none;')
      await page.waitForSelector('.prod-coupon-download-content')

    // HTML 분석 및 정보 크롤링
    const $ = load(await page.content())
    const name = $('.prod-buy-header__title').text()
    const options = $('.prod-option__item')
      .toArray()
      .map((e) => ({
        title: $(e).find('.title').text(),
        value: $(e).find('.value').text().trim(),
      }))
    const originalPrice = $('.origin-price').text()
    const salePrice = $('.prod-sale-price > .total-price').text().trim()
    const couponPrice = $('.prod-coupon-price > .total-price').text().trim()
    const coupon = $('.prod-coupon-download-item__on')
      .toArray()
      .map((e) => ({
        discount: $(e).find('.prod-coupon-price').text(),
        condition: $(e).find('.prod-coupon-desc').text(),
      }))
    const creditCard = $('.ccid-benefit-badge__inr')
      .toArray()
      .map((e) => ({
        discount: $(e).find('.benefit-label > b').text(),
        companies: $(e)
          .find('img')
          .toArray()
          .map((e) => $(e).attr('src'))
          .map((imageUrl) => `https:${imageUrl}`),
      }))
    const reward = $('.reward-cash-txt').text()
    const imageUrl = `https:${$('.prod-image__detail').attr('src')}`
    const reviewCount = $('#prod-review-nav-link > span.count').text()
    const isOutOfStock = Boolean($('.oos-label').text())

    const prices = [originalPrice, salePrice, couponPrice]
      .map((price) => price.replace(/,|원/g, ''))
      .filter((price) => price)
      .map((price) => +price)
    const minimumPrice = Math.min(...prices)
    console.log('👀 - minimumPrice', minimumPrice)

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
                title: name,
                body: `${minimumPrice}원 도달`,
                url: productURL,
                imageUrl,
                // data: {},
              }),
            })
            const result = (await response.json()) as Record<string, any>
            console.log('👀 - result', result)

            if (result.data) {
              // pool.query('insert into notification (flare_lane_id,,,,) values ($1,,,,)', [
              //   result.data.id,
              // ])
            } else {
              console.error(result)
            }
          }

          // Telegram
          const telegramUserId = row.telegram_user_id

          if (row.should_notify_by_telegram && telegramUserId) {
            const a = await telegramBot.sendMessage(
              telegramUserId,
              `${name}\n\n${minimumPrice}\n\n`
            )
            console.log('👀 - a', a)

            // pool.query('insert into notification (flare_lane_id,,,,) values ($1,,,,)', [a])
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
  return true
}
