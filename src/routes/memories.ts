import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })

  app.get('/memories', async (req, res) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub,
      },
      include: {
        likes: {
          include: {
            user: true,
          },
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        ...memory,
        excerpt:
          memory.content.length > 50
            ? memory.content.substring(0, 50).concat('...')
            : memory.content,
      }
    })
  })

  app.get('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUnique({
      where: {
        id,
      },
    })

    if (!memory) return res.callNotFound()

    if (memory.userId !== req.user.sub) {
      res.status(401).send('Unauthorized')
    }
    return memory
  })

  app.post('/memories', async (req, res) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      objectKey: z.string(),
      isPublic: z.coerce.boolean().default(false),
      createdAt: z.string(),
    })

    const { content, coverUrl, isPublic, createdAt, objectKey } =
      bodySchema.parse(req.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        objectKey,
        createdAt,
        userId: req.user.sub,
      },
      include: {
        likes: {
          include: {
            user: true,
          },
        },
      },
    })

    return memory
  })

  app.put('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      objectKey: z.string(),
      isPublic: z.coerce.boolean().default(false),
      createdAt: z.string(),
    })

    const { content, coverUrl, isPublic, createdAt, objectKey } =
      bodySchema.parse(req.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        objectKey,
        isPublic,
        createdAt,
      },
      include: {
        likes: {
          include: {
            user: true,
          },
        },
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }

    await prisma.like.deleteMany({
      where: {
        memoryId: memory.id,
      },
    })

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })

  app.post('/memories/like', async (req, res) => {
    const bodySchema = z.object({
      memoryId: z.string().uuid(),
      userId: z.string().uuid(),
    })

    const { memoryId, userId } = bodySchema.parse(req.body)

    const like = prisma.like.create({
      data: {
        memoryId,
        userId,
      },
    })

    return like
  })

  app.delete('/memories/like/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    await prisma.like.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return await prisma.like.delete({
      where: {
        id,
      },
    })
  })

  app.get('/memories/like/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const like = await prisma.like.findMany({
      where: {
        memoryId: id,
      },
    })

    return like
  })
}
