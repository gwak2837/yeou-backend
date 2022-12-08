import { randomUUID } from 'crypto'
import path from 'path'

import { FastifyInstance } from 'fastify'

import { bucket } from '../common/google-storage'

type UploadResult = {
  fileName: string
  url: string
}

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/upload/images', async function (request, reply) {
    // if (!request.userId) throw UnauthorizedError('로그인 후 시도해주세요')

    const files = request.files()
    const result: UploadResult[] = []

    for await (const file of files) {
      if (file.file) {
        // if (!file.mimetype.startsWith('image/'))
        //   throw BadRequestError('이미지 파일만 업로드할 수 있습니다')

        const timestamp = ~~(Date.now() / 1000)
        const fileExtension = path.extname(file.filename)
        const fileName = `${timestamp}-${randomUUID()}${fileExtension}`

        bucket
          .file(fileName)
          .save(await file.toBuffer())
          .then(() =>
            result.push({
              fileName: file.filename,
              url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
            })
          )
          .catch((error) => console.log(error))
      }
    }

    reply.status(201).send(result)
  })
}
