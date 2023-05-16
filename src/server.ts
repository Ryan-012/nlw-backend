import fastify from 'fastify'
// import { PrismaClient } from '@prisma/client'
const app = fastify()

app.get('/', (req, res) => {
  return 'Hello World'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running...')
  })
