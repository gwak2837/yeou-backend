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
