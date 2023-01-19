import { Type } from '@sinclair/typebox'
import LunarJS from 'lunar-javascript'
import fetch from 'node-fetch'

import { KAKAO_ADMIN_KEY, KAKAO_CLIENT_SECRET, KAKAO_REST_API_KEY } from '../../common/constants'
import { ForbiddenError, UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import { getFrontendUrl } from '../../common/utils'
import { IGetKakaoUserResult } from './sql/getKakaoUser'
import getKakaoUser from './sql/getKakaoUser.sql'
import removeKakaoOAuth from './sql/removeKakaoOAuth.sql'
// import getUser from './sql/getUser.sql'
// import type { IUpdateKakaoUserResult } from './sql/updateKakaoUser'
// import updateKakaoUser from './sql/updateKakaoUser.sql'
import { querystringCode, querystringCodeState } from '.'
import { TFastify } from '..'

const Lunar = LunarJS.Lunar

export default async function routes(fastify: TFastify) {
  fastify.get('/auth/kakao', querystringCode, async (req, res) => {
    const code = req.query.code

    const kakaoUserToken = await fetchKakaoUserToken(code)
    if (kakaoUserToken.error) throw UnauthorizedError('유효하지 않은 접근입니다')

    const kakaoUser = await fetchKakaoUser(kakaoUserToken.access_token)
    if (!kakaoUser.id) throw ForbiddenError('권한이 없습니다')

    const { rowCount, rows } = await pool.query<IGetKakaoUserResult>(getKakaoUser, [kakaoUser.id])
    const jayudamUser = rows[0]

    const frontendUrl = getFrontendUrl(req.headers.referer)

    // 소셜 로그인 정보가 없는 경우
    if (rowCount === 0) {
      unregisterKakaoUser(kakaoUser.id)
      return res.redirect(`${frontendUrl}/oauth?error=not-kakao-user`)
    }

    const querystring = new URLSearchParams({
      jwt: await res.jwtSign({ userId: jayudamUser.id }),
    })

    return res.redirect(`${frontendUrl}/oauth?${querystring}`)
  })

  fastify.get('/auth/kakao/register', querystringCodeState, async (req, res) => {
    // const code = req.query.code
    // const jwt = req.query.state
    // const frontendUrl = getFrontendUrl(req.headers.referer)
    // // JWT 유효성 검사
    // const verifiedJwt = (await req.jwtDecode()) as Record<string, string>
    // if (!verifiedJwt.iat) throw UnauthorizedError('사용자를 인증할 수 없습니다')
    // const logoutTime = await redisClient.get(`${verifiedJwt.userId}:logoutTime`)
    // if (Number(logoutTime) > Number(verifiedJwt.iat))
    //   return res.redirect(`${frontendUrl}/oauth?doesJWTExpired=true`)
    // // 자유담 사용자 정보, OAuth 사용자 정보 가져오기
    // const [{ rowCount, rows: userResult }, kakaoUser2] = await Promise.all([
    //   pool.query<IGetUserResult>(getUser, [verifiedJwt.userId]),
    //   fetchFromKakao(code),
    // ])
    // if (rowCount === 0 || !kakaoUser2.id) return res.status(400).send('Bad Request') // user가 존재하지 않으면 JWT secret key가 유출됐다는 뜻
    // const jayudamUser = userResult[0]
    // const kakaoUser = kakaoUser2.kakao_account
    // const kakaoUserBirthday = getKakaoSolarBirthday(kakaoUser)
    // // 이미 OAuth 연결되어 있으면
    // if (jayudamUser.oauth_kakao)
    //   return res.redirect(`${frontendUrl}/oauth?isAlreadyAssociatedWithOAuth=true&oauth=kakao`)
    // // OAuth 사용자 정보와 자유담 사용자 정보 비교
    // if (
    //   jayudamUser.sex !== encodeSex(kakaoUser.gender) ||
    //   (jayudamUser.legal_name && jayudamUser.name !== kakaoUser.name) ||
    //   (jayudamUser.birthyear && jayudamUser.birthyear !== kakaoUser.birthyear) ||
    //   (jayudamUser.birthday && jayudamUser.birthday !== kakaoUserBirthday) ||
    //   (jayudamUser.phone_number && jayudamUser.phone_number !== kakaoUser.phone_number)
    // ) {
    //   unregisterKakaoUser(kakaoUser2.id)
    //   return res.redirect(`${frontendUrl}/oauth?jayudamUserMatchWithOAuthUser=false&oauth=kakao`)
    // }
    // await pool.query(updateKakaoUser, [
    //   jayudamUser.id,
    //   kakaoUser.email,
    //   kakaoUser.profile.is_default_image ? null : [kakaoUser.profile.profile_image_url],
    //   kakaoUser2.id,
    // ])
    // return res.redirect(
    //   `${frontendUrl}/oauth?${new URLSearchParams({
    //     jwt: await res.jwtSign({ userId: jayudamUser.id }),
    //     ...(jayudamUser.name && { username: jayudamUser.name }),
    //   })}`
    // )
  })

  type OAuthKakaoUnregister = {
    Querystring: {
      user_id: string
      referrer_type: string
    }
  }

  const opts3 = {
    schema: {
      querystring: Type.Object({
        user_id: Type.String(),
        referrer_type: Type.Literal('UNLINK_FROM_APPS'),
      }),
    },
  }

  fastify.get<OAuthKakaoUnregister>('/auth/kakao/unregister', opts3, async (req, res) => {
    if (req.headers.Authorization !== `KakaoAK ${KAKAO_ADMIN_KEY}`)
      return res.status(400).send('Bad Request')

    console.log('👀 - req.query.user_id', req.query.user_id)
    console.log('👀 - req.query.referrer_type', req.query.referrer_type)
    pool.query(removeKakaoOAuth, [req.query.user_id])
  })
}

async function fetchKakaoUserToken(code: string) {
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      code,
      client_secret: KAKAO_CLIENT_SECRET,
    }).toString(),
  })

  return response.json() as Promise<Record<string, any>>
}

async function fetchKakaoUser(accessToken: string) {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.json() as Promise<Record<string, any>>
}

export async function unregisterKakaoUser(kakaoUserId: string) {
  return fetch('https://kapi.kakao.com/v1/user/unlink', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
    },
    body: new URLSearchParams({
      target_id_type: 'user_id',
      target_id: kakaoUserId,
    }).toString(),
  })
}

function getKakaoSolarBirthday(kakaoUser: any) {
  if (!kakaoUser.birthday) return null

  if (kakaoUser.birthday_type === 'SOLAR') return kakaoUser.birthday

  const solarFromLunar = Lunar.fromYmd(
    kakaoUser.birthyear,
    +kakaoUser.birthday.slice(0, 2),
    +kakaoUser.birthday.slice(2)
  ).getSolar()

  return `${solarFromLunar.getMonth().padStart(2, '0')}${solarFromLunar.getDay().padStart(2, '0')}`
}
