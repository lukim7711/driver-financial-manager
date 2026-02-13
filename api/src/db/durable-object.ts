import type { DurableObject } from 'cloudflare:workers'
import { SCHEMA_SQL } from './schema'
import { SEED_SQL } from './seed'

export class MoneyManagerDB implements DurableObject {
  private sql: SqlStorage

  constructor(state: DurableObjectState, env: unknown) {
    this.sql = state.storage.sql
    this.initialize()
  }

  private initialize() {
    // Create tables if not exist
    this.sql.exec(SCHEMA_SQL)

    // Check if seed data already exists
    const result = this.sql.exec('SELECT COUNT(*) as count FROM debts')
    const count = result?.[0]?.count as number | undefined

    // Seed data only if tables are empty
    if (!count || count === 0) {
      this.sql.exec(SEED_SQL)
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path === '/query' && request.method === 'POST') {
        const { query, params } = await request.json() as { query: string; params?: unknown[] }
        const result = this.sql.exec(query, ...(params || []))
        return Response.json({ success: true, data: result })
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
