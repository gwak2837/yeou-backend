/* eslint-disable no-console */
import { createWriteStream, mkdirSync, rmSync } from 'fs'
import { exit } from 'process'

import pgCopy from 'pg-copy-streams'

import { CSV_PATH, pool2 } from './index.js'

const { to } = pgCopy

// 폴더 다시 만들기
rmSync(`database/data/${CSV_PATH}`, { recursive: true, force: true })
mkdirSync(`database/data/${CSV_PATH}`, { recursive: true })

let fileCount = 0

const client = await pool2.connect()

const { rows } = await client.query('SELECT schema_name FROM information_schema.schemata')

for (const row of rows) {
  const schemaName = row.schema_name
  if (schemaName !== 'pg_catalog' && schemaName !== 'information_schema') {
    const { rows: rows2 } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='${schemaName}'`
    )

    for (const row2 of rows2) {
      fileCount += 1

      const tableName = row2.tablename
      console.log(`👀 - ${schemaName}.${tableName}`)

      const csvPath = `database/data/${CSV_PATH}/${schemaName}.${tableName}.csv`
      const fileStream = createWriteStream(csvPath)

      const sql = `COPY ${schemaName}.${tableName} TO STDOUT WITH CSV DELIMITER ',' HEADER ENCODING 'UTF-8'`
      const stream = client.query(to(sql))
      stream.pipe(fileStream)

      stream.on('end', () => {
        fileCount -= 1
        if (fileCount === 0) {
          client.release()
          exit()
        }
      })
    }
  }
}
