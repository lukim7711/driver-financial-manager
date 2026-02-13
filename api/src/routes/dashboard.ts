import { Hono } from 'hono'
import type { ApiResponse } from '../types'

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
}

interface TodaySummary {
  income: number
  expense: number
  debt_payment: number
  profit: number
  transaction_count: number
}

interface BudgetInfo {
  total_daily: number
  spent_today: number
  remaining: number
  percentage_used: number
}

interface UpcomingDue {
  debt_id: string
  platform: string
  due_date: string
  amount: number
  days_until: number
  urgency: 'overdue' | 'critical' | 'warning' | 'normal'
}

interface DebtSummary {
  total_original: number
  total_remaining: number
  total_paid: number
  progress_percentage: number
  target_date: string
}

interface DashboardData {
  date: string
  today: TodaySummary
  budget: BudgetInfo
  upcoming_dues: UpcomingDue[]
  debt_summary: DebtSummary
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

function getUrgency(daysUntil: number): UpcomingDue['urgency'] {
  if (daysUntil <= 0) return 'overdue'
  if (daysUntil <= 3) return 'critical'
  if (daysUntil <= 7) return 'warning'
  return 'normal'
}

route.get('/', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Parameter date wajib (YYYY-MM-DD)' },
        400
      )
    }

    const db = getDB(c.env)

    // 1. Today's transaction summary
    const txRows = await queryDB(db,
      `SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as expense,
        COALESCE(SUM(CASE WHEN type='debt_payment' THEN amount ELSE 0 END), 0) as debt_payment,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE created_at LIKE ? AND is_deleted = 0`,
      [`${date}%`]
    )
    const tx = txRows[0] || {}
    const income = Number(tx.income) || 0
    const expense = Number(tx.expense) || 0
    const debtPayment = Number(tx.debt_payment) || 0
    const txCount = Number(tx.transaction_count) || 0

    const today: TodaySummary = {
      income,
      expense,
      debt_payment: debtPayment,
      profit: income - expense - debtPayment,
      transaction_count: txCount,
    }

    // 2. Budget calculation
    const settingsRows = await queryDB(db,
      `SELECT key, value FROM settings WHERE key LIKE 'budget_%'`
    )
    let totalBudget = 0
    for (const row of settingsRows) {
      totalBudget += Number(row.value) || 0
    }
    // Default budget if no settings
    if (totalBudget === 0) totalBudget = 172000

    const spentNonDebt = expense
    const budgetRemaining = totalBudget - spentNonDebt
    const pctUsed = totalBudget > 0
      ? Math.round((spentNonDebt / totalBudget) * 100)
      : 0

    const budget: BudgetInfo = {
      total_daily: totalBudget,
      spent_today: spentNonDebt,
      remaining: budgetRemaining,
      percentage_used: pctUsed,
    }

    // 3. Upcoming dues (next 7 days + overdue)
    const dueRows = await queryDB(db,
      `SELECT ds.debt_id, d.platform, ds.due_date, ds.amount
      FROM debt_schedule ds
      JOIN debts d ON ds.debt_id = d.id
      WHERE ds.status = 'unpaid' AND ds.due_date <= date(?, '+7 days')
      ORDER BY ds.due_date ASC`,
      [date]
    )

    const upcoming_dues: UpcomingDue[] = dueRows.map((row) => {
      const dueDate = String(row.due_date)
      const diffMs = new Date(dueDate).getTime() - new Date(date).getTime()
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return {
        debt_id: String(row.debt_id),
        platform: String(row.platform),
        due_date: dueDate,
        amount: Number(row.amount) || 0,
        days_until: daysUntil,
        urgency: getUrgency(daysUntil),
      }
    })

    // 4. Debt summary
    const debtRows = await queryDB(db,
      `SELECT
        COALESCE(SUM(total_original), 0) as total_original,
        COALESCE(SUM(total_remaining), 0) as total_remaining
      FROM debts`
    )
    const debtAgg = debtRows[0] || {}
    const totalOriginal = Number(debtAgg.total_original) || 0
    const totalRemaining = Number(debtAgg.total_remaining) || 0
    const totalPaid = totalOriginal - totalRemaining
    const progressPct = totalOriginal > 0
      ? Math.round((totalPaid / totalOriginal) * 100)
      : 0

    // Get target date from settings
    const targetRows = await queryDB(db,
      `SELECT value FROM settings WHERE key = 'debt_target_date'`
    )
    const targetDate = targetRows[0]
      ? String(targetRows[0].value)
      : '2026-04-13'

    const debt_summary: DebtSummary = {
      total_original: totalOriginal,
      total_remaining: totalRemaining,
      total_paid: totalPaid,
      progress_percentage: progressPct,
      target_date: targetDate,
    }

    const data: DashboardData = {
      date,
      today,
      budget,
      upcoming_dues,
      debt_summary,
    }

    return c.json<ApiResponse<DashboardData>>({
      success: true,
      data,
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as dashboardRoute }
