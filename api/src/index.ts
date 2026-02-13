import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { MoneyManagerDB } from './db/durable-object'

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
  OCR_SPACE_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Logger middleware (only in development)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT !== 'production') {
    return logger()(c, next)
  }
  await next()
})

// CORS middleware
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

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: 'Driver Financial Manager API',
      version: '0.1.0',
      environment: c.env.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
    },
  })
})

// Helper to get DO stub
function _getDB(env: Bindings) {
  const id = env.DB.idFromName('default')
  return env.DB.get(id)
}

// API routes (stubs — will be expanded per feature)
app.get('/api/transactions', async (_c) => {
  // TODO: Implement transaction query via DO
  return _c.json({ success: true, data: [] })
})

app.get('/api/debts', async (_c) => {
  // TODO: Implement debts query via DO
  return _c.json({ success: true, data: [] })
})

app.get('/api/dashboard', async (_c) => {
  // TODO: Implement dashboard aggregation via DO
  return _c.json({
    success: true,
    data: {
      today: { income: 0, expense: 0, profit: 0, budget_remaining: 0 },
      debts: { total_remaining: 0, next_due: null },
    },
  })
})

app.get('/api/settings', async (_c) => {
  // TODO: Implement settings query via DO
  return _c.json({ success: true, data: {} })
})

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Endpoint not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  return c.json({
    success: false,
    error: c.env.ENVIRONMENT === 'production' ? 'Internal server error' : err.message,
  }, 500)
})

// Export Durable Object class
export { MoneyManagerDB }

export default app
