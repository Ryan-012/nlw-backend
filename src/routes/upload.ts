import { FastifyInstance } from 'fastify'
import { S3 } from 'aws-sdk'
import { randomUUID } from 'crypto'
import { extname } from 'path'

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
    }

    try {
      await s3.upload(params).promise()

      const fileUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
      console.log(fileUrl)

      return { fileUrl }
    } catch (error) {
      console.error(error)
      return res.status(500).send()
    }
  })
}
