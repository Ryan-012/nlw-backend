import { FastifyInstance } from 'fastify'
import { S3 } from 'aws-sdk'
import { randomUUID } from 'crypto'
import { extname } from 'path'
import { z } from 'zod'

export async function uploadRoutes(app: FastifyInstance) {
  const s3 = new S3()

  app.post('/upload', async (req, res) => {
    const upload = await req.file({
      limits: {
        fileSize: 5_242_800, // 5mb
      },
    })

    if (!upload) return res.status(400).send()

    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) return res.status(400).send()

    const fileId = randomUUID()
    const extension = extname(upload.filename)
    const fileName = fileId.concat(extension)

    const params = {
      Bucket: 'nlw-spacetime-project',
      Key: fileName,
      Body: upload.file,
      ACL: 'public-read-write',
    }

    try {
      await s3.upload(params).promise()

      const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
      return { fileUrl, objectKey: params.Key }
    } catch (error) {
      console.error(error)
      return res.status(500).send()
    }
  })

  app.delete('/deleteImage/:objectKey', async (req, res) => {
    const paramsSchema = z.object({
      objectKey: z.string(),
    })

    const { objectKey } = paramsSchema.parse(req.params)

    const params = {
      Bucket: 'nlw-spacetime-project',
      Key: objectKey,
    }

    try {
      await s3.deleteObject(params).promise()
    } catch (error) {
      console.log(error)
      return res.status(500).send()
    }
  })
}
