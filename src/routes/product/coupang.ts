import { load } from 'cheerio'
import { Browser, Page } from 'puppeteer'

import { BadRequestError } from '../../common/fastify'
import { KoreanToNum, stringToNum } from '../../common/utils'

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

  // HTTP server push로 응답 미리 보내주기
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
  const originalPrice = stringToNum(
    $('.origin-price')
      .text()
      .replace(/[^0-9]/g, '')
  )
  const salePrice = stringToNum(
    $('.prod-sale-price > .total-price')
      .text()
      .replace(/[^0-9]/g, '')
  )
  const couponPrice = stringToNum(
    $('.prod-coupon-price > .total-price')
      .text()
      .replace(/[^0-9]/g, '')
  )
  const reward = stringToNum(
    $('.reward-cash-txt')
      .text()
      .replace(/[^0-9]/g, '')
  )
  const coupons = $('.prod-coupon-download-item__on')
    .toArray()
    .map((e) => ({
      discount: $(e).find('.prod-coupon-price').text(),
      condition: $(e).find('.prod-coupon-desc').text(),
    }))
  const cards = getCardDiscounts(cardDiscountContent)
  const imageURL = `https:${$('.prod-image__detail').attr('src')}`
  const reviewCount = $('#prod-review-nav-link > span.count').text()
  const isOutOfStock = Boolean($('.oos-label').text())

  const prices = []
  if (originalPrice) prices.push(originalPrice)
  if (salePrice) prices.push(salePrice)
  if (couponPrice) prices.push(couponPrice)
  const minimumPriceBeforeDiscount = Math.min(...prices)

  const rewards = [0]
  if (reward) rewards.push(reward)

  const cardDiscounts = [0]
  for (const card of cards) {
    const cardDiscount = []
    if (card.absolute) cardDiscount.push(card.absolute)
    if (card.relative) cardDiscount.push((card.relative * minimumPriceBeforeDiscount) / 100)
    if (cardDiscount.length !== 0) cardDiscounts.push(Math.min(...cardDiscount))
  }

  const maximumCardDiscount = Math.max(...cardDiscounts)
  const maximumDiscount = Math.max(...rewards, maximumCardDiscount)

  return {
    name,
    options,
    originalPrice,
    salePrice,
    couponPrice,
    cards: cards.length === 0 ? null : cards,
    maximumCardDiscount: maximumCardDiscount || null,
    coupons: coupons.length === 0 ? null : coupons,
    reward,
    maximumDiscount: maximumDiscount || null,
    minimumPrice: minimumPriceBeforeDiscount - maximumDiscount,
    imageURL,
    reviewURL: `${url}#sdpReview`,
    reviewCount,
    isOutOfStock,
  }
}

const findAbsoluteKoreanNumber = /최대 (.+)원 까지/
const findRelativeNumber = /(\d+)%/

function getCardDiscounts(cardDiscount?: string) {
  if (!cardDiscount) return []

  const $$ = load(cardDiscount)
  return $$('#react-root > div > div:nth-child(2) > table > tbody > tr')
    .toArray()
    .map((e) => {
      const cardDiscountSentence = $$(e).find('p').text()
      return {
        company: $$(e).find('.benefit-table__card-logo').attr('src'),
        absolute: KoreanToNum(findAbsoluteKoreanNumber.exec(cardDiscountSentence)?.[1]),
        relative: stringToNum(findRelativeNumber.exec(cardDiscountSentence)?.[1]),
        onlyWOW: $$(e).find('.wow-only-badge').length !== 0,
      }
    })
}
