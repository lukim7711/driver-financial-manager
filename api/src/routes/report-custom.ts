import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'

const route = new Hono<{ Bindings: Bindings }>()

const EXPENSE_META: Record<string, { emoji: string; label: string }> = {
  bbm:     { emoji: '\u26fd', label: 'BBM' },
  makan:   { emoji: '\ud83c\udf5c', label: 'Makan' },
  rokok:   { emoji: '\ud83d\udeac', label: 'Rokok' },
  pulsa:   { emoji: '\ud83d\udcf1', label: 'Pulsa' },
  rt:      { emoji: '\ud83c\udfe0', label: 'RT' },
  parkir:  { emoji: '\ud83c\udd7f\ufe0f', label: 'Parkir' },
  service: { emoji: '\ud83d\udd27', label: 'Service' },
  lainnya: { emoji: '\ud83d\udce6', label: 'Lainnya' },
}

const INCOME_META: Record<string, { emoji: string; label: string }> = {
  order:    { emoji: '\ud83d\udef5', label: 'Order' },
  tips:     { emoji: '\ud83d\udc9d', label: 'Tips' },
  bonus:    { emoji: '\ud83c\udf81', label: 'Bonus' },
  insentif: { emoji: '\ud83c\udfc6', label: 'Insentif' },
  lainnya:  { emoji: '\ud83d\udce6', label: 'Lainnya' },
}

function diffDays(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  return Math.round((db - da) / 86400000) + 1
}

// GET /api/report/custom?start=YYYY-MM-DD&end=YYYY-MM-DD
route.get('/custom', async (c) => {
  try {
    const start = c.req.query('start')
    const end = c.req.query('end')
    const dateRe = /^\d{4}-\d{2}-\d{2}$/

    if (!start || !end || !dateRe.test(start) || !dateRe.test(end)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Parameter start & end wajib (YYYY-MM-DD)' },
        400
      )
    }
    if (start > end) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'start harus <= end' },
        400
      )
    }

    const db = getDB(c.env)
    const rangeStart = `${start}T00:00:00+07:00`
    const rangeEnd = `${end}T23:59:59+07:00`

    const rows = await queryDB(db,
      `SELECT * FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0
       ORDER BY created_at ASC`,
      [rangeStart, rangeEnd]
    )

    let totalIncome = 0
    let totalExpense = 0
    let totalDebt = 0
    const activeDaySet = new Set<string>()
    const expenseMap = new Map<string, number>()
    const incomeMap = new Map<string, { total: number; count: number }>()

    for (const r of rows) {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      const cat = String(r.category)
      const txDate = String(r.created_at).slice(0, 10)
      activeDaySet.add(txDate)

      if (type === 'income') {
        totalIncome += amt
        const prev = incomeMap.get(cat) ?? { total: 0, count: 0 }
        incomeMap.set(cat, { total: prev.total + amt, count: prev.count + 1 })
      } else if (type === 'expense') {
        totalExpense += amt
        expenseMap.set(cat, (expenseMap.get(cat) ?? 0) + amt)
      } else if (type === 'debt_payment') {
        totalDebt += amt
      }
    }

    const totalDays = diffDays(start, end)
    const activeDays = activeDaySet.size || 1
    const profit = totalIncome - totalExpense - totalDebt

    const topExpenses = Array.from(expenseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, total]) => {
        const meta = EXPENSE_META[cat] ?? { emoji: '\ud83d\udce6', label: cat }
        return {
          category: cat,
          emoji: meta.emoji,
          label: meta.label,
          total,
          percentage: totalExpense > 0
            ? Math.round((total / totalExpense) * 100) : 0,
        }
      })

    const incomeBreakdown = Array.from(incomeMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, data]) => {
        const meta = INCOME_META[cat] ?? { emoji: '\ud83d\udce6', label: cat }
        return {
          category: cat,
          emoji: meta.emoji,
          label: meta.label,
          total: data.total,
          count: data.count,
        }
      })

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        start,
        end,
        total_days: totalDays,
        active_days: activeDays,
        summary: {
          income: totalIncome,
          expense: totalExpense,
          debt_payment: totalDebt,
          profit,
          transaction_count: rows.length,
        },
        averages: {
          daily_income: Math.round(totalIncome / activeDays),
          daily_expense: Math.round(totalExpense / activeDays),
          daily_profit: Math.round(profit / activeDays),
        },
        top_expenses: topExpenses,
        income_breakdown: incomeBreakdown,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    }, 500)
  }
})

export { route as reportCustomRoute }
