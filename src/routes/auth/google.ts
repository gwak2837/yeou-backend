import fetch from 'node-fetch'

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../common/constants'
import { ForbiddenError, UnauthorizedError } from '../../common/fastify'
import { pool } from '../../common/postgres'
import { getFrontendURL } from '../../common/utils'
import { IGetGoogleUserResult } from './sql/getGoogleUser'
import getGoogleUser from './sql/getGoogleUser.sql'
import { querystringCode } from '.'
import { TFastify } from '..'

export default async function routes(fastify: TFastify) {
  fastify.get('/auth/google', querystringCode, async (req, res) => {
    const code = req.query.code
    const backendUrl = req.headers[':authority']
    if (!backendUrl) throw UnauthorizedError('유효하지 않은 접근입니다')

    const googleUserToken = await fetchGoogleUserToken(code, backendUrl)
    if (googleUserToken.error) throw UnauthorizedError('유효하지 않은 접근입니다')

    const googleUser = await fetchGoogleUser(googleUserToken.access_token)
    if (googleUser.error) throw ForbiddenError('권한이 없습니다')

    const { rowCount, rows } = await pool.query<IGetGoogleUserResult>(getGoogleUser, [
      googleUser.id,
    ])
    const user = rows[0]

    const frontendURL = getFrontendURL(req.headers.referer)

    // 소셜 로그인 정보가 없는 경우
    if (rowCount === 0) return res.redirect(`${frontendURL}/oauth?error=not-google-user`)

    const querystring = new URLSearchParams({
      jwt: await res.jwtSign({ userId: user.id }),
      ...(user.name && { username: user.name }),
    })

    return res.redirect(`${frontendURL}/oauth?${querystring}`)
  })
}

async function fetchGoogleUserToken(code: string, backendUrl: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `https://${backendUrl}/auth/google`,
      grant_type: 'authorization_code',
    }).toString(),
  })

  return response.json() as Promise<Record<string, any>>
}

async function fetchGoogleUser(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return response.json() as Promise<Record<string, any>>
}
