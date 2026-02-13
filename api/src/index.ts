import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { MoneyManagerDB } from './db/durable-object'

type Bindings = {
  DB: DurableObjectNamespace<MoneyManagerDB>
  ENVIRONMENT: string
  OCR_SPACE_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: 'Driver Financial Manager API',
      version: '0.1.0',
      environment: c.env.ENVIRONMENT || 'development',
    },
  })
})

// API routes (stub for now)
app.get('/api/transactions', async (c) => {
  return c.json({ success: true, data: [] })
})

app.get('/api/debts', async (c) => {
  return c.json({ success: true, data: [] })
})

app.get('/api/dashboard', async (c) => {
  return c.json({
    success: true,
    data: {
      today: { income: 0, expense: 0, profit: 0, budget_remaining: 0 },
      debts: { total_remaining: 0, next_due: null },
    },
  })
})

// Export Durable Object class
export { MoneyManagerDB }

export default app
