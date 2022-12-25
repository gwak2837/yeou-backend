import { load } from 'cheerio'
import { Page } from 'puppeteer'

export default async function getCoupangProductInfo(page: Page) {
  // 쿠팡 로그인
  // await page.goto('https://login.coupang.com/login/login.pang')

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
    minimumPrice,
  }
}
