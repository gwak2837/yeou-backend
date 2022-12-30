import { FRONTEND_URL } from './constants'

const vercelURLRegEx = /^https:\/\/jayudam-[-a-z0-9]{1,20}-gwak2837\.vercel\.app\//

export function getFrontendUrl(referer?: string) {
  if (!referer) return FRONTEND_URL

  // dev, feature, fix 브랜치 배포 주소
  if (referer.match(vercelURLRegEx)) return referer.substring(0, referer.length - 1)

  switch (referer) {
    case 'http://localhost:3000/':
    case 'https://jayudam.app/':
    case 'https://jayudam.vercel.app/':
      return referer.substring(0, referer.length - 1)
    default:
      return FRONTEND_URL
  }
}

export function encodeSex(sex: string) {
  switch (sex) {
    case 'M':
    case 'male':
      return 1
    case 'F':
    case 'female':
      return 2
    default:
      return 0
  }
}

const numberHan = '영일이삼사오육칠팔구'
const number = '0123456789'
const units = { 십: 10, 백: 100, 천: 1000, 만: 10000, 억: 100000000, 조: 1000000000000 } as const

export function KoreanToNum(koreanNum?: string) {
  if (!koreanNum) return null

  koreanNum = koreanNum.replace(/[^0-9가-힣]/gi, '')
  const source = koreanNum.split('')
  const sourceLength = source.length - 1

  let result = 0
  let tmp = 0
  let num = 0
  let check = 0

  source.forEach((token, i) => {
    check = numberHan.indexOf(token)

    if (check < 0 && number.indexOf(token) > -1) {
      check = number.indexOf(token)
    }

    if ('십백천'.indexOf(token) > -1) {
      num += (tmp === 0 ? 1 : tmp) * units[token as '십' | '백' | '천']
      tmp = 0
    } else if ('만억조'.indexOf(token) > -1) {
      num += tmp
      result += (num === 0 ? 1 : num) * units[token as '만' | '억' | '조']
      tmp = 0
      num = 0
    } else if (check > -1) {
      tmp = tmp * 10 + check
    }

    if (i === sourceLength) {
      result += num + tmp
    }
  })

  return result
}
