import 'dotenv/config'
import fastify from 'fastify'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { authRoutes } from './routes/auth'
import { memoriesRoutes } from './routes/memories'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'node:path'
import { UserRoutes } from './routes/user'
const app = fastify()

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(multipart)

app.register(cors, {
  origin: ['https://nlw-frontend-psi.vercel.app', 'http://localhost:3000'],
})
app.register(jwt, {
  secret: 'process.env.SECRET_KEY',
})
app.register(authRoutes)

app.register(memoriesRoutes)
app.register(uploadRoutes)
app.register(UserRoutes)
app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Server running...')
  })
