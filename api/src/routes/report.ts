import { Hono } from 'hono'
import type { ApiResponse } from '../types'

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
}

const route = new Hono<{ Bindings: Bindings }>()

function getDB(env: Bindings) {
  const id = env.DB.idFromName('default')
  return env.DB.get(id)
}

async function queryDB(db: DurableObjectStub, sql: string, params: unknown[] = []) {
  const res = await db.fetch(new Request('http://do/query', {
    method: 'POST',
    body: JSON.stringify({ query: sql, params }),
  }))
  const result = await res.json() as ApiResponse<Record<string, unknown>[]>
  return result.data || []
}

interface CategoryMeta {
  emoji: string
  label: string
  budget: number
}

const EXPENSE_CATEGORIES: Record<string, CategoryMeta> = {
  bbm:     { emoji: '⛽', label: 'BBM',     budget: 40000 },
  makan:   { emoji: '🍜', label: 'Makan',   budget: 25000 },
  rokok:   { emoji: '🚬', label: 'Rokok',   budget: 27000 },
  pulsa:   { emoji: '📱', label: 'Pulsa',   budget: 5000 },
  rt:      { emoji: '🏠', label: 'RT',      budget: 75000 },
  parkir:  { emoji: '🅿️', label: 'Parkir',  budget: 0 },
  service: { emoji: '🔧', label: 'Service', budget: 0 },
  lainnya: { emoji: '📦', label: 'Lainnya', budget: 0 },
}

const INCOME_CATEGORIES: Record<string, { emoji: string; label: string }> = {
  order:    { emoji: '🛵', label: 'Order' },
  tips:     { emoji: '💝', label: 'Tips' },
  bonus:    { emoji: '🎁', label: 'Bonus' },
  insentif: { emoji: '🏆', label: 'Insentif' },
  lainnya:  { emoji: '📦', label: 'Lainnya' },
}

// GET /api/report/daily?date=YYYY-MM-DD
route.get('/daily', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Parameter date wajib (YYYY-MM-DD)' },
        400
      )
    }

    const db = getDB(c.env)
    const dateStart = `${date}T00:00:00+07:00`
    const dateEnd = `${date}T23:59:59+07:00`

    const rows = await queryDB(db,
      `SELECT * FROM transactions
       WHERE created_at >= ? AND created_at <= ? AND is_deleted = 0
       ORDER BY created_at ASC`,
      [dateStart, dateEnd]
    )

    let income = 0
    let expense = 0
    let debtPayment = 0

    const expenseMap = new Map<string, number>()
    const incomeMap = new Map<string, { total: number; count: number }>()

    const transactions = rows.map((r) => {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      const cat = String(r.category)

      if (type === 'income') {
        income += amt
        const prev = incomeMap.get(cat) ?? { total: 0, count: 0 }
        incomeMap.set(cat, { total: prev.total + amt, count: prev.count + 1 })
      } else if (type === 'expense') {
        expense += amt
        expenseMap.set(cat, (expenseMap.get(cat) ?? 0) + amt)
      } else if (type === 'debt_payment') {
        debtPayment += amt
      }

      return {
        id: String(r.id),
        created_at: String(r.created_at),
        type,
        amount: amt,
        category: cat,
        note: r.note ? String(r.note) : '',
        source: r.source ? String(r.source) : 'manual',
        debt_id: r.debt_id ? String(r.debt_id) : null,
      }
    })

    const profit = income - expense - debtPayment

    const expenseByCategory = Object.entries(EXPENSE_CATEGORIES).map(
      ([cat, meta]) => {
        const spent = expenseMap.get(cat) ?? 0
        const pct = meta.budget > 0
          ? Math.round((spent / meta.budget) * 100)
          : (spent > 0 ? 100 : 0)
        return {
          category: cat,
          emoji: meta.emoji,
          label: meta.label,
          spent,
          budget: meta.budget,
          percentage: pct,
        }
      }
    )

    const incomeByCategory = Array.from(incomeMap.entries()).map(
      ([cat, data]) => {
        const meta = INCOME_CATEGORIES[cat] ?? { emoji: '📦', label: cat }
        return {
          category: cat,
          emoji: meta.emoji,
          label: meta.label,
          total: data.total,
          count: data.count,
        }
      }
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        date,
        summary: {
          income,
          expense,
          debt_payment: debtPayment,
          profit,
          transaction_count: transactions.length,
        },
        expense_by_category: expenseByCategory,
        income_by_category: incomeByCategory,
        transactions,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as reportRoute }
