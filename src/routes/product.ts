import { Type } from '@sinclair/typebox'
import { load } from 'cheerio'

import { BadRequestError } from '../common/fastify'
import puppeteer from '../common/puppeteer'
import { TFastify } from '.'

export default async function routes(fastify: TFastify, options: Record<string, unknown>) {
  const schema = {
    querystring: Type.Object({
      url: Type.String(),
    }),
  }

  fastify.get('/product', { schema }, async (req, res) => {
    const productURL = req.query.url

    // Headless browser
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
    const originalPrice = $('.origin-price').text()
    const price = $('.prod-sale-price > .total-price').text().trim()
    const price2 = $('.prod-coupon-price > .total-price').text().trim()
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

    const imageUrl = $('.prod-image__detail').attr('src')
    const reviewCount = $('#prod-review-nav-link > span.count').text()
    const name = $('.prod-buy-header__title').text()
    const isOutOfStock = Boolean($('.oos-label').text())

    return {
      name,
      originalPrice,
      price,
      price2,
      coupon,
      creditCard,
      // creditCardCompanies,
      imageUrl: `https:${imageUrl}`,
      reviewCount,
      isOutOfStock,
    }

    // Save result
    // const { rows } = await pool.query('SELECT id FROM product WHERE url = $1', [productURL])
    // pool.query('INSERT INTO product_history (price, product_id) values ($1, $2)', [price, rows[0].id])
  })
}
