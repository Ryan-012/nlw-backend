import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
// import { z } from 'zod'

export async function UserRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })

  app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({
      where: {},
    })

    return users
  })

  app.get('/users/:id', async (req, res) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memories: {
          where: {
            isPublic: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            likes: true,
          },
        },
      },
    })

    if (!user) return res.callNotFound()

    return user
  })
}
