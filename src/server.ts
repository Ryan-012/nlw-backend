import 'dotenv/config'
import fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { authRoutes } from './routes/auth'
import { memoriesRoutes } from './routes/memories'
const app = fastify()

app.register(cors, {
  origin: true,
})
app.register(jwt, {
  secret: 'process.env.SECRET_KEY',
})
app.register(authRoutes)

app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Server running...')
  })
