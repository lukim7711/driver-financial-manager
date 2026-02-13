import { DurableObject } from 'cloudflare:workers'
import { SCHEMA_SQL } from './schema'
import { SEED_SQL } from './seed'

interface Env {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
  OCR_SPACE_API_KEY?: string
}

export class MoneyManagerDB extends DurableObject<Env> {
  private initialized = false

  private ensureInitialized() {
    if (this.initialized) return

    // Create tables if not exist
    this.ctx.storage.sql.exec(SCHEMA_SQL)

    // Check if seed data already exists (idempotent)
    const cursor = this.ctx.storage.sql.exec('SELECT COUNT(*) as count FROM debts')
    const row = [...cursor][0]
    const count = row?.count as number | undefined

    // Seed data only if tables are empty
    if (!count || count === 0) {
      this.ctx.storage.sql.exec(SEED_SQL)
    }

    this.initialized = true
  }

  async fetch(request: Request): Promise<Response> {
    this.ensureInitialized()

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // POST /query - Execute custom SQL query
      if (path === '/query' && request.method === 'POST') {
        const body = await request.json() as { query: string; params?: unknown[] }
        const { query, params = [] } = body

        const cursor = this.ctx.storage.sql.exec(query, ...params)
        const rows = [...cursor]
        return Response.json({ success: true, data: rows })
      }

      // GET /health - Health check
      if (path === '/health' && request.method === 'GET') {
        return Response.json({
          success: true,
          data: { status: 'healthy', initialized: this.initialized },
        })
      }

      return Response.json(
        { success: false, error: 'Unknown endpoint' },
        { status: 404 }
      )
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Database error',
        },
        { status: 500 }
      )
    }
  }
}
