import fetch from 'node-fetch'

import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from '../../common/constants'
import { ForbiddenError, UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import { getFrontendURL } from '../../common/utils'
import { IGetNaverUserResult } from './sql/getNaverUser'
import getNaverUser from './sql/getNaverUser.sql'
import { querystringCodeState } from '.'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  fastify.get('/auth/naver', querystringCodeState, async (req, res) => {
    const code = req.query.code
    const state = req.query.state
    const backendUrl = req.headers[':authority']
    if (!backendUrl) throw UnauthorizedError('유효하지 않은 접근입니다')

    const naverUserToken = await fetchNaverUserToken(code, backendUrl, state)
    if (naverUserToken.error) throw UnauthorizedError('유효하지 않은 접근입니다')

    const { message, response: naverUser } = await fetchNaverUser(naverUserToken.access_token)
    if (message !== 'success') throw ForbiddenError('권한이 없습니다')

    const { rowCount, rows } = await pool.query<IGetNaverUserResult>(getNaverUser, [naverUser.id])
    const user = rows[0]

    const frontendURL = getFrontendURL(req.headers.referer)

    // 소셜 로그인 정보가 없는 경우
    if (rowCount === 0) return res.redirect(`${frontendURL}/oauth?error=not-naver-user`)

    const querystring = new URLSearchParams({
      jwt: await res.jwtSign({ id: user.id }),
      ...(user.name && { username: user.name }),
    })

    return res.redirect(`${frontendURL}/oauth?${querystring}`)
  })

  fastify.get('/auth/naver/register', querystringCodeState, async (req, res) => {
    // const code = req.query.code
    // const jwt = req.query.state
    // const backendUrl = req.headers[':authority']
    // if (!backendUrl) return res.status(400).send('Bad Request')
    // const frontendUrl = getFrontendUrl(req.headers.referer)
    // // JWT 유효성 검사
    // const verifiedJwt = await verifyJWT(jwt)
    // if (!verifiedJwt.iat) return res.status(401).send('Not Unauthorized')
    // const logoutTime = await redisClient.get(`${verifiedJwt.userId}:logoutTime`)
    // if (Number(logoutTime) > Number(verifiedJwt.iat))
    //   return res.redirect(`${frontendUrl}/oauth?doesJWTExpired=true`)
    // // 자유담 사용자 정보, OAuth 사용자 정보 가져오기
    // const [{ rowCount, rows: userResult }, naverUser] = await Promise.all([
    //   poolQuery<IGetUserResult>(getUser, [verifiedJwt.userId]),
    //   fetchFromNaver(code, backendUrl, jwt),
    // ])
    // if (rowCount === 0 || naverUser.error) return res.status(400).send('Bad Request') // user가 존재하지 않으면 JWT secret key가 유출됐다는 뜻
    // const jayudamUser = userResult[0]
    // // 이미 OAuth 연결되어 있으면
    // if (jayudamUser.oauth_naver)
    //   return res.redirect(`${frontendUrl}/oauth?isAlreadyAssociatedWithOAuth=true&oauth=naver`)
    // // OAuth 사용자 정보와 자유담 사용자 정보 비교
    // if (
    //   jayudamUser.sex !== encodeSex(naverUser.gender) ||
    //   (jayudamUser.legal_name && jayudamUser.name !== naverUser.name) ||
    //   (jayudamUser.birthyear && jayudamUser.birthyear !== naverUser.birthyear) ||
    //   (jayudamUser.birthday && jayudamUser.birthday !== encodeBirthDay(naverUser.birthday)) ||
    //   (jayudamUser.phone_number && jayudamUser.phone_number !== naverUser.mobile)
    // )
    //   return res.redirect(`${frontendUrl}/oauth?jayudamUserMatchWithOAuthUser=false&oauth=naver`)
    // await poolQuery(updateNaverUser, [
    //   jayudamUser.id,
    //   naverUser.email,
    //   naverUser.profile_image ? [naverUser.profile_image] : null,
    //   naverUser.id,
    // ])
    // return res.redirect(
    //   `${frontendUrl}/oauth?${new URLSearchParams({
    //     jwt: await signJWT({ userId: jayudamUser.id }),
    //     ...(jayudamUser.name && { username: jayudamUser.name }),
    //   })}`
    // )
  })
}

async function fetchNaverUserToken(code: string, backendUrl: string, state: string) {
  const response = await fetch(
    `https://nid.naver.com/oauth2.0/token?${new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: NAVER_CLIENT_ID,
      client_secret: NAVER_CLIENT_SECRET,
      code,
      redirect_uri: `https://${backendUrl}/auth/naver`,
      state,
    })}`,
    {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    }
  )

  return response.json() as Promise<Record<string, any>>
}

async function fetchNaverUser(accessToken: string) {
  const response = await fetch('https://openapi.naver.com/v1/nid/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.json() as Promise<Record<string, any>>
}

function encodeBirthDay(birthday: string) {
  return birthday.replace('-', '')
}
