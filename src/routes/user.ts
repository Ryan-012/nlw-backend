import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
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
}
