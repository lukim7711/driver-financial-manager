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

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu',
  'Kamis', 'Jumat', 'Sabtu',
]

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

// GET /api/report/daily?date=YYYY-MM-DD
route.get('/daily', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Parameter date wajib (YYYY-MM-DD)',
        },
        400
      )
    }

    const db = getDB(c.env)
    const dateStart = `${date}T00:00:00+07:00`
    const dateEnd = `${date}T23:59:59+07:00`

    const rows = await queryDB(db,
      `SELECT * FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0
       ORDER BY created_at ASC`,
      [dateStart, dateEnd]
    )

    let income = 0
    let expense = 0
    let debtPayment = 0

    const expenseMap = new Map<string, number>()
    const incomeMap = new Map<
      string, { total: number; count: number }
    >()

    const transactions = rows.map((r) => {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      const cat = String(r.category)

      if (type === 'income') {
        income += amt
        const prev = incomeMap.get(cat) ?? {
          total: 0, count: 0,
        }
        incomeMap.set(cat, {
          total: prev.total + amt,
          count: prev.count + 1,
        })
      } else if (type === 'expense') {
        expense += amt
        expenseMap.set(
          cat, (expenseMap.get(cat) ?? 0) + amt
        )
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

    const expenseByCategory = Object.entries(
      EXPENSE_CATEGORIES
    ).map(([cat, meta]) => {
      const spent = expenseMap.get(cat) ?? 0
      return {
        category: cat,
        emoji: meta.emoji,
        label: meta.label,
        spent,
        budget: 0,
        percentage: 0,
      }
    })

    const incomeByCategory = Array.from(
      incomeMap.entries()
    ).map(([cat, data]) => {
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

// GET /api/report/weekly?date=YYYY-MM-DD
route.get('/weekly', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Parameter date wajib (YYYY-MM-DD)',
        },
        400
      )
    }

    const db = getDB(c.env)
    const monday = getMonday(date)
    const sunday = addDays(monday, 6)

    const weekStart = `${monday}T00:00:00+07:00`
    const weekEnd = `${sunday}T23:59:59+07:00`

    const rows = await queryDB(db,
      `SELECT * FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0
       ORDER BY created_at ASC`,
      [weekStart, weekEnd]
    )

    const prevMonday = addDays(monday, -7)
    const prevSunday = addDays(prevMonday, 6)
    const prevStart = `${prevMonday}T00:00:00+07:00`
    const prevEnd = `${prevSunday}T23:59:59+07:00`

    const prevRows = await queryDB(db,
      `SELECT type, amount FROM transactions
       WHERE created_at >= ? AND created_at <= ?
         AND is_deleted = 0`,
      [prevStart, prevEnd]
    )

    const dailyMap = new Map<string, {
      income: number
      expense: number
      debt_payment: number
      count: number
    }>()

    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, i)
      dailyMap.set(d, {
        income: 0, expense: 0,
        debt_payment: 0, count: 0,
      })
    }

    let totalIncome = 0
    let totalExpense = 0
    let totalDebt = 0
    const expenseMap = new Map<string, number>()
    const incomeMap = new Map<
      string, { total: number; count: number }
    >()
    const activeDaySet = new Set<string>()

    for (const r of rows) {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      const cat = String(r.category)
      const txDate = String(r.created_at).slice(0, 10)

      activeDaySet.add(txDate)

      const day = dailyMap.get(txDate)
      if (day) {
        day.count++
        if (type === 'income') {
          day.income += amt
          totalIncome += amt
          const prev = incomeMap.get(cat) ?? {
            total: 0, count: 0,
          }
          incomeMap.set(cat, {
            total: prev.total + amt,
            count: prev.count + 1,
          })
        } else if (type === 'expense') {
          day.expense += amt
          totalExpense += amt
          expenseMap.set(
            cat, (expenseMap.get(cat) ?? 0) + amt
          )
        } else if (type === 'debt_payment') {
          day.debt_payment += amt
          totalDebt += amt
        }
      }
    }

    const activeDays = activeDaySet.size || 1
    const totalProfit =
      totalIncome - totalExpense - totalDebt

    const daily = Array.from(dailyMap.entries()).map(
      ([d, v]) => {
        const dayDate = new Date(d)
        return {
          date: d,
          day_name: DAY_NAMES[dayDate.getDay()],
          income: v.income,
          expense: v.expense,
          debt_payment: v.debt_payment,
          profit: v.income - v.expense - v.debt_payment,
          transaction_count: v.count,
        }
      }
    )

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

    let prevIncome = 0
    let prevExpense = 0
    let prevDebt = 0
    for (const r of prevRows) {
      const amt = Number(r.amount) || 0
      const type = String(r.type)
      if (type === 'income') prevIncome += amt
      else if (type === 'expense') prevExpense += amt
      else if (type === 'debt_payment') prevDebt += amt
    }
    const prevProfit = prevIncome - prevExpense - prevDebt

    const calcTrend = (
      curr: number, prev: number
    ): number => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(
        ((curr - prev) / prev) * 100
      )
    }

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        week_start: monday,
        week_end: sunday,
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
          prev_week_start: prevMonday,
          prev_week_end: prevSunday,
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
        daily,
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

export { route as reportRoute }
