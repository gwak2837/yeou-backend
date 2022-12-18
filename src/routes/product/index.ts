import { Type } from '@sinclair/typebox'
import { load } from 'cheerio'

import { BadRequestError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import puppeteer from '../../common/puppeteer'
import saveProductHistory from './sql/saveProductHistory.sql'
import { TFastify } from '..'

export default async function routes(fastify: TFastify, options: Record<string, unknown>) {
  const schema = {
    querystring: Type.Object({
      url: Type.String(),
    }),
  }

  fastify.get('/product', { schema }, async (req, res) => {
    const rawURL = new URL(req.query.url)
    rawURL.searchParams.sort()
    const productURL = rawURL.toString()

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    // 쿠팡 로그인 await page.goto('https://login.coupang.com/login/login.pang')
    try {
      await page.goto(productURL)
    } catch (err) {
      throw BadRequestError('Failed fetching HTML')
    }
    await page.waitForSelector('.prod-coupon-download-btn')
    const getStyle = 'document.querySelector(".prod-coupon-download-btn").getAttribute("style")'
    const couponButtonStyle = await page.evaluate(getStyle)
    if (couponButtonStyle !== 'display: none;')
      await page.waitForSelector('.prod-coupon-download-content')

    // HTML parsing
    const $ = load(await page.content())
    const name = $('.prod-buy-header__title').text()
    const option = $('.prod-option__item')
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

    const imageUrl = $('.prod-image__detail').attr('src')
    const reviewCount = $('#prod-review-nav-link > span.count').text()
    const isOutOfStock = Boolean($('.oos-label').text())

    const prices = [originalPrice, salePrice, couponPrice] as any[]
    prices
      .map((price) => price.replace(/,|원/g, ''))
      .filter((price) => price)
      .map((price) => +price)

    pool.query(saveProductHistory, [name, imageUrl, productURL, isOutOfStock, Math.min(...prices)])

    return {
      name,
      option,
      originalPrice,
      salePrice,
      couponPrice,
      coupon,
      creditCard,
      reward,
      imageUrl: `https:${imageUrl}`,
      reviewCount,
      isOutOfStock,
    }
  })
}
