import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { transactionRoute } from './routes/transaction'
import { dashboardRoute } from './routes/dashboard'
import { MoneyManagerDB } from './db/durable-object'

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
  OCR_SPACE_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT !== 'production') {
    return logger()(c, next)
  }
  await next()
})

app.use('*', cors({
  origin: (origin) => {
    if (origin.includes('localhost:3000')) return origin
    if (origin.endsWith('.pages.dev')) return origin
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: 'Driver Financial Manager API',
      version: '0.2.0',
      environment: c.env.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
    },
  })
})

// API routes
app.route('/api/transactions', transactionRoute)
app.route('/api/dashboard', dashboardRoute)

// Stub routes
app.get('/api/debts', async (c) => {
  return c.json({ success: true, data: [] })
})

app.get('/api/settings', async (c) => {
  return c.json({ success: true, data: {} })
})

app.notFound((c) => {
  return c.json({ success: false, error: 'Endpoint not found' }, 404)
})

app.onError((err, c) => {
  return c.json({
    success: false,
    error: c.env.ENVIRONMENT === 'production' ? 'Internal server error' : err.message,
  }, 500)
})

export { MoneyManagerDB }

export default app
