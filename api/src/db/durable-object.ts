import type { DurableObject, DurableObjectState } from 'cloudflare:workers'
import { SCHEMA_SQL } from './schema'
import { SEED_SQL } from './seed'

export class MoneyManagerDB implements DurableObject {
  private sql: SqlStorage
  private initialized = false

  constructor(state: DurableObjectState) {
    this.sql = state.storage.sql
  }

  private async initialize() {
    if (this.initialized) return

    // Create tables if not exist
    this.sql.exec(SCHEMA_SQL)

    // Check if seed data already exists
    const result = this.sql.exec('SELECT COUNT(*) as count FROM debts')
    const count = result?.[0]?.count as number | undefined

    // Seed data only if tables are empty (idempotent)
    if (!count || count === 0) {
      this.sql.exec(SEED_SQL)
    }

    this.initialized = true
  }

  async fetch(request: Request): Promise<Response> {
    // Initialize on first request
    await this.initialize()

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // POST /query - Execute custom SQL query
      if (path === '/query' && request.method === 'POST') {
        const body = await request.json() as { query: string; params?: unknown[] }
        const { query, params = [] } = body
        
        const result = this.sql.exec(query, ...params)
        return Response.json({ success: true, data: result })
      }

      // GET /health - Health check
      if (path === '/health' && request.method === 'GET') {
        return Response.json({ success: true, data: { status: 'healthy', initialized: this.initialized } })
      }

      return Response.json({ success: false, error: 'Unknown endpoint' }, { status: 404 })
    } catch (error) {
      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error',
      }, { status: 500 })
    }
  }
}
