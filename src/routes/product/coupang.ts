import { load } from 'cheerio'
import { Browser, Page } from 'puppeteer'

import { BadRequestError } from '../../common/fastify'
import { KoreanToNum } from '../../common/utils'

export default async function getCoupangProductInfo(browser: Browser, url: string) {
  const page = await browser.newPage()

  try {
    await page.goto(url)
  } catch (err) {
    throw BadRequestError('해당 URL 접속에 실패했습니다')
  }

  // 쿠팡 로그인
  // await page.goto('https://login.coupang.com/login/login.pang')

  // 쿠팡 접속 대기
  await page.waitForSelector('.prod-coupon-download-btn')
  const getStyle = 'document.querySelector(".prod-coupon-download-btn").getAttribute("style")'
  const couponButtonStyle = await page.evaluate(getStyle)
  if (couponButtonStyle !== 'display: none;')
    await page.waitForSelector('.prod-coupon-download-content')

  // 카드 할인 정보 대기
  let cardDiscountFrame
  if ((await page.$('.ccid-detail-help-icon')) !== null) {
    await page.click('.ccid-detail-help-icon')
    const elementHandle = await page.waitForSelector('#creditCardBenefitContent > iframe')
    cardDiscountFrame = await elementHandle?.contentFrame()
    await cardDiscountFrame?.waitForSelector('#react-root > div > div:nth-child(2) > table > tbody')
  }

  const content = await page.content()
  const cardDiscountContent = await cardDiscountFrame?.content()
  page.close()

  // HTML 분석 및 정보 크롤링
  const $ = load(content)
  const name = $('.prod-buy-header__title').text()
  const options = $('.prod-option__item')
    .toArray()
    .map((e) => ({
      title: $(e).find('.title').text(),
      value: $(e).find('.value').text().trim(),
    }))
  const originalPrice = +$('.origin-price')
    .text()
    .replace(/[^0-9]/g, '')
  const salePrice = +$('.prod-sale-price > .total-price')
    .text()
    .replace(/[^0-9]/g, '')
  const couponPrice = +$('.prod-coupon-price > .total-price')
    .text()
    .replace(/[^0-9]/g, '')
  const reward = +$('.reward-cash-txt')
    .text()
    .replace(/[^0-9]/g, '')
  const coupons = $('.prod-coupon-download-item__on')
    .toArray()
    .map((e) => ({
      discount: $(e).find('.prod-coupon-price').text(),
      condition: $(e).find('.prod-coupon-desc').text(),
    }))
  const cardDiscounts = getCardDiscounts(cardDiscountContent)
  const imageUrl = `https:${$('.prod-image__detail').attr('src')}`
  const reviewCount = $('#prod-review-nav-link > span.count').text()
  const isOutOfStock = Boolean($('.oos-label').text())

  // const maxCardDiscount =
  //   (couponPrice ?? salePrice ?? originalPrice ?? 0) *
  //   (Math.max(...creditCards.map((card) => +card.discount.slice(0, -1))) / 100)
  // const minimumPrice =
  //   Math.min(originalPrice, salePrice, couponPrice) - Math.max(maxCardDiscount, reward)

  return {
    name,
    options,
    originalPrice: originalPrice ? +originalPrice : null,
    salePrice: salePrice ? +salePrice : null,
    couponPrice: couponPrice ? +couponPrice : null,
    reward,
    coupons,
    minimumPrice: 0,
    cardDiscounts,
    imageUrl,
    reviewCount,
    isOutOfStock,
  }
}

const findAbsoluteKoreanNumber = /최대 (.+)원 까지/
const findRelativeNumber = /(\d+)%/

function getCardDiscounts(cardDiscount?: string) {
  if (!cardDiscount) return null

  const $$ = load(cardDiscount)
  return $$('#react-root > div > div:nth-child(2) > table > tbody > tr')
    .toArray()
    .map((e) => {
      const cardDiscountSentence = $$(e).find('p').text()
      return {
        company: $$(e).find('.benefit-table__card-logo').attr('src'),
        absolute: KoreanToNum(findAbsoluteKoreanNumber.exec(cardDiscountSentence)?.[1]),
        relative: findRelativeNumber.exec(cardDiscountSentence)?.[1],
        onlyWOW: $$(e).find('.wow-only-badge').length !== 0,
      }
    })
}
