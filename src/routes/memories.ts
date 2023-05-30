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

      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        ...memory,
        excerpt: memory.content.substring(0, 50).concat('...'),
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

    if (!memory.isPublic && memory.userId !== req.user.sub) {
      res.status(401).send('Unauthorized')
    }
    return memory
  })

  app.post('/memories', async (req, res) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      createdAt: z.string(),
    })

    const { content, coverUrl, isPublic, createdAt } = bodySchema.parse(
      req.body,
    )

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        createdAt,
        userId: req.user.sub,
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
      isPublic: z.coerce.boolean().default(false),
      createdAt: z.string(),
    })

    const { content, coverUrl, isPublic, createdAt } = bodySchema.parse(
      req.body,
    )

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
        isPublic,
        createdAt,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== req.user.sub) {
      return res.status(401).send()
    }
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
