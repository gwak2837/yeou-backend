/* eslint-disable no-console */
import { createReadStream, readFileSync } from 'fs'
import { exit } from 'process'
import { createInterface } from 'readline'

import pgCopy from 'pg-copy-streams'

import { CSV_PATH, pool } from './index.js'

const { from } = pgCopy

const client = await pool.connect()

try {
  console.log('BEGIN')
  await client.query('BEGIN')

  const initialization = readFileSync('database/initialization.sql', 'utf8').toString()
  await client.query(initialization)

  // 테이블 생성 순서와 동일하게
  const tables = [
    'public.user',
    'public.cert_pending',
    'public.cert',
    'public.hashtag',
    'public.notification',
    'public.post',
    'public.verification_history',
    'public.chatroom',
    'public.chat',
    'public.chatroom_x_user',
    'public.hashtag_x_post',
    'public.hashtag_x_user',
    'public.post_x_user',
    'public.post_x_mentioned_user',
    'public.user_x_user',
  ]

  // GENERATED ALWAYS AS IDENTITY 컬럼이 있는 테이블
  const sequenceTables = [
    '"user"',
    'cert_pending',
    'cert',
    'hashtag',
    'notification',
    'post',
    'verification_history',
    'chatroom',
    'chat',
  ]

  for (const table of tables) {
    console.log('👀 - table', table)

    try {
      const csvPath = `database/data/${CSV_PATH}/${table}.csv`
      const columns = await readFirstLine(csvPath)
      const fileStream = createReadStream(csvPath)

      const sql = `COPY ${table}(${columns}) FROM STDIN WITH CSV DELIMITER ',' HEADER ENCODING 'UTF-8'`
      const stream = client.query(from(sql))
      fileStream.pipe(stream)
    } catch (error) {
      console.log('👀 - error', error)
    }
  }

  for (const sequenceTable of sequenceTables) {
    console.log('👀 - sequenceTable', sequenceTable)

    client.query(`LOCK TABLE ${sequenceTable} IN EXCLUSIVE MODE`)
    client.query(
      `SELECT setval(pg_get_serial_sequence('${sequenceTable}', 'id'), COALESCE((SELECT MAX(id)+1 FROM ${sequenceTable}), 1), false)`
    )
  }

  console.log('COMMIT')
  await client.query('COMMIT')
} catch (error) {
  console.log('ROLLBACK')
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}

exit()

// Utils
async function readFirstLine(path: string) {
  const inputStream = createReadStream(path)
  // eslint-disable-next-line no-unreachable-loop
  for await (const line of createInterface(inputStream)) return line
  inputStream.destroy()
}