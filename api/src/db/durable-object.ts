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
    const cursor = this.ctx.storage.sql.exec(
      'SELECT COUNT(*) as count FROM debts'
    )
    const row = [...cursor][0]
    const count = row?.count as number | undefined

    // Seed data only if tables are empty
    if (!count || count === 0) {
      this.ctx.storage.sql.exec(SEED_SQL)
    }

    // F013 Migration: move budget_rt → monthly_expenses
    this.migrateBudgetRt()

    // F012 Migration: add is_deleted + created_at to debts
    this.migrateDebtsColumns()

    this.initialized = true
  }

  private migrateBudgetRt() {
    const rtCursor = this.ctx.storage.sql.exec(
      `SELECT value FROM settings WHERE key = 'budget_rt'`
    )
    const rtRow = [...rtCursor][0]
    if (!rtRow) return

    const rtValue = Number(rtRow.value) || 0
    if (rtValue <= 0) {
      this.ctx.storage.sql.exec(
        `DELETE FROM settings WHERE key = 'budget_rt'`
      )
      return
    }

    const existCursor = this.ctx.storage.sql.exec(
      `SELECT id FROM monthly_expenses WHERE id = 'me-rt'`
    )
    const existRow = [...existCursor][0]

    if (!existRow) {
      this.ctx.storage.sql.exec(
        `INSERT INTO monthly_expenses
          (id, name, emoji, amount, is_deleted, created_at)
        VALUES
          ('me-rt', 'RT/Rumah Tangga', '🏠', ?, 0,
           '2026-02-12T00:00:00+07:00')`,
        rtValue
      )
    } else {
      this.ctx.storage.sql.exec(
        `UPDATE monthly_expenses
         SET amount = ? WHERE id = 'me-rt'`,
        rtValue
      )
    }

    this.ctx.storage.sql.exec(
      `DELETE FROM settings WHERE key = 'budget_rt'`
    )
  }

  private migrateDebtsColumns() {
    // Add is_deleted column if missing
    try {
      this.ctx.storage.sql.exec(
        `ALTER TABLE debts ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0`
      )
    } catch {
      // Column already exists, ignore
    }

    // Add created_at column if missing
    try {
      this.ctx.storage.sql.exec(
        `ALTER TABLE debts ADD COLUMN created_at TEXT`
      )
    } catch {
      // Column already exists, ignore
    }
  }

  async fetch(request: Request): Promise<Response> {
    this.ensureInitialized()

    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path === '/query' && request.method === 'POST') {
        const body = await request.json() as {
          query: string
          params?: unknown[]
        }
        const { query, params = [] } = body
        const cursor = this.ctx.storage.sql.exec(
          query, ...params
        )
        const rows = [...cursor]
        return Response.json({ success: true, data: rows })
      }

      if (path === '/health' && request.method === 'GET') {
        return Response.json({
          success: true,
          data: {
            status: 'healthy',
            initialized: this.initialized,
          },
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
          error: error instanceof Error
            ? error.message
            : 'Database error',
        },
        { status: 500 }
      )
    }
  }
}
