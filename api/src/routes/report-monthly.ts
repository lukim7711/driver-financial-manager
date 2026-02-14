import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'

const route = new Hono<{ Bindings: Bindings }>()

interface CategoryMeta {
  emoji: string
  label: string
}

const EXPENSE_CATEGORIES: Record<string, CategoryMeta> = {
  bbm:     { emoji: '\u26fd', label: 'BBM' },
  makan:   { emoji: '\ud83c\udf5c', label: 'Makan' },
  rokok:   { emoji: '\ud83d\udeac', label: 'Rokok' },
  pulsa:   { emoji: '\ud83d\udcf1', label: 'Pulsa' },
  rt:      { emoji: '\ud83c\udfe0', label: 'RT' },
  parkir:  { emoji: '\ud83c\udd7f\ufe0f', label: 'Parkir' },
  service: { emoji: '\ud83d\udd27', label: 'Service' },
  lainnya: { emoji: '\ud83d\udce6', label: 'Lainnya' },
}

const INCOME_CATEGORIES: Record<string, CategoryMeta> = {
  order:    { emoji: '\ud83d\udef5', label: 'Order' },
  tips:     { emoji: '\ud83d\udc9d', label: 'Tips' },
  bonus:    { emoji: '\ud83c\udf81', label: 'Bonus' },
  insentif: { emoji: '\ud83c\udfc6', label: 'Insentif' },
  lainnya:  { emoji: '\ud83d\udce6', label: 'Lainnya' },
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April',
  'Mei', 'Juni', 'Juli', 'Agustus',
  'September', 'Oktober', 'November', 'Desember',
]

function getDaysInMonth(
  year: number, month: number
): number {
  return new Date(year, month, 0).getDate()
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// GET /api/report/monthly?month=YYYY-MM
route.get('/monthly', async (c) => {
  try {
    const month = c.req.query('month')
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Parameter month wajib (YYYY-MM)',
        },
        400
      )
    }

    // Safe to split after regex validation
    const parts = month.split('-')
    const year = parseInt(parts[0] ?? '0', 10)
    const mo = parseInt(parts[1] ?? '0', 10)
    const daysInMonth = getDaysInMonth(year, mo)
    const monthLabel = `${MONTH_NAMES[mo - 1]} ${year}`

    const db = getDB(c.env)
    const lastDay = String(daysInMonth).padStart(2, '0')
    const monthStart = `${month}-01T00:00:00+07:00`
    const monthEnd = `${month}-${lastDay}T23:59:59+07:00`

    const rows = await queryDB(db,
      `SELECT * FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0
       ORDER BY created_at ASC`,
      [monthStart, monthEnd]
    )

    // Previous month
    const prevMo = mo === 1 ? 12 : mo - 1
    const prevYear = mo === 1 ? year - 1 : year
    const prevMonth = `${prevYear}-${String(prevMo).padStart(2, '0')}`
    const prevDays = getDaysInMonth(prevYear, prevMo)
    const prevLast = String(prevDays).padStart(2, '0')
    const prevStart = `${prevMonth}-01T00:00:00+07:00`
    const prevEnd = `${prevMonth}-${prevLast}T23:59:59+07:00`

    const prevRows = await queryDB(db,
      `SELECT type, amount FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0`,
      [prevStart, prevEnd]
    )

    // Aggregate current month
    let totalIncome = 0
    let totalExpense = 0
    let totalDebt = 0
    const activeDaySet = new Set<string>()
    const expenseMap = new Map<string, number>()
    const incomeMap = new Map<
      string, { total: number; count: number }
    >()

    // Weekly breakdown
    const weeklyMap = new Map<string, {
      week_start: string
      week_end: string
      income: number
      expense: number
      debt_payment: number
      count: number
    }>()

    for (const r of rows) {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      const cat = String(r.category)
      const txDate = String(r.created_at).slice(0, 10)

      activeDaySet.add(txDate)

      if (type === 'income') {
        totalIncome += amt
        const prev = incomeMap.get(cat) ?? {
          total: 0, count: 0,
        }
        incomeMap.set(cat, {
          total: prev.total + amt,
          count: prev.count + 1,
        })
      } else if (type === 'expense') {
        totalExpense += amt
        expenseMap.set(
          cat, (expenseMap.get(cat) ?? 0) + amt
        )
      } else if (type === 'debt_payment') {
        totalDebt += amt
      }

      // Group by week
      const monday = getMonday(txDate)
      const sunday = addDays(monday, 6)
      if (!weeklyMap.has(monday)) {
        weeklyMap.set(monday, {
          week_start: monday,
          week_end: sunday,
          income: 0,
          expense: 0,
          debt_payment: 0,
          count: 0,
        })
      }
      const week = weeklyMap.get(monday)
      if (week) {
        week.count++
        if (type === 'income') week.income += amt
        else if (type === 'expense') week.expense += amt
        else if (type === 'debt_payment') {
          week.debt_payment += amt
        }
      }
    }

    const activeDays = activeDaySet.size || 1
    const totalProfit =
      totalIncome - totalExpense - totalDebt

    // Previous month aggregates
    let prevIncome = 0
    let prevExpense = 0
    let prevDebtPay = 0
    for (const r of prevRows) {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      if (type === 'income') prevIncome += amt
      else if (type === 'expense') prevExpense += amt
      else if (type === 'debt_payment') prevDebtPay += amt
    }
    const prevProfit =
      prevIncome - prevExpense - prevDebtPay

    const calcTrend = (
      curr: number, prev: number
    ): number => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(
        ((curr - prev) / prev) * 100
      )
    }

    // Build weekly array sorted
    let weekIdx = 1
    const weekly = Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, w]) => ({
        week_start: w.week_start,
        week_end: w.week_end,
        week_label: `Minggu ${weekIdx++}`,
        income: w.income,
        expense: w.expense,
        debt_payment: w.debt_payment,
        profit: w.income - w.expense - w.debt_payment,
        transaction_count: w.count,
      }))

    // Top expenses
    const topExpenses = Array.from(
      expenseMap.entries()
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, total]) => {
        const meta = EXPENSE_CATEGORIES[cat] ?? {
          emoji: '\ud83d\udce6', label: cat,
        }
        const pct = totalExpense > 0
          ? Math.round((total / totalExpense) * 100)
          : 0
        return {
          category: cat,
          emoji: meta.emoji,
          label: meta.label,
          total,
          percentage: pct,
        }
      })

    // Income breakdown
    const incomeBreakdown = Array.from(
      incomeMap.entries()
    )
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, data]) => {
        const meta = INCOME_CATEGORIES[cat] ?? {
          emoji: '\ud83d\udce6', label: cat,
        }
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
        month,
        month_label: monthLabel,
        days_in_month: daysInMonth,
        active_days: activeDays,
        summary: {
          income: totalIncome,
          expense: totalExpense,
          debt_payment: totalDebt,
          profit: totalProfit,
          transaction_count: rows.length,
        },
        averages: {
          daily_income: Math.round(
            totalIncome / activeDays
          ),
          daily_expense: Math.round(
            totalExpense / activeDays
          ),
          daily_profit: Math.round(
            totalProfit / activeDays
          ),
        },
        comparison: {
          prev_month: prevMonth,
          prev_month_label:
            `${MONTH_NAMES[prevMo - 1]} ${prevYear}`,
          prev_income: prevIncome,
          prev_expense: prevExpense,
          prev_profit: prevProfit,
          income_trend: calcTrend(
            totalIncome, prevIncome
          ),
          expense_trend: calcTrend(
            totalExpense, prevExpense
          ),
          profit_trend: calcTrend(
            totalProfit, prevProfit
          ),
        },
        weekly,
        top_expenses: topExpenses,
        income_breakdown: incomeBreakdown,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Server error',
      },
      500
    )
  }
})

export { route as reportMonthlyRoute }
