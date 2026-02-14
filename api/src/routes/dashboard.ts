import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'

interface TodaySummary {
  income: number
  expense: number
  debt_payment: number
  profit: number
  transaction_count: number
}

interface BudgetInfo {
  daily_total: number
  total_monthly: number
  spent_today: number
  remaining: number
  percentage_used: number
}

interface DailyTarget {
  target_amount: number
  earned_today: number
  gap: number
  is_on_track: boolean
  is_rest_day: boolean
  rest_days: number[]
  breakdown: {
    daily_expense: number
    prorated_monthly: number
    total_monthly: number
    daily_debt: number
    days_in_month: number
  }
  days_remaining: number
  working_days_remaining: number
  target_date: string
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
  daily_target: DailyTarget
  upcoming_dues: UpcomingDue[]
  debt_summary: DebtSummary
}

const route = new Hono<{ Bindings: Bindings }>()

function getUrgency(
  daysUntil: number
): UpcomingDue['urgency'] {
  if (daysUntil <= 0) return 'overdue'
  if (daysUntil <= 3) return 'critical'
  if (daysUntil <= 7) return 'warning'
  return 'normal'
}

function getDaysInMonth(dateStr: string): number {
  const d = new Date(dateStr)
  return new Date(
    d.getFullYear(), d.getMonth() + 1, 0
  ).getDate()
}

function parseRestDays(raw: string): number[] {
  if (!raw || raw.trim() === '') return []
  return raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 0 && n <= 6)
}

function isRestDay(
  dateStr: string,
  restDays: number[]
): boolean {
  if (restDays.length === 0) return false
  const d = new Date(dateStr + 'T12:00:00+07:00')
  return restDays.includes(d.getDay())
}

function countWorkingDays(
  startDate: string,
  endDate: string,
  restDays: number[]
): number {
  if (restDays.length === 0) {
    const diffMs =
      new Date(endDate).getTime() -
      new Date(startDate).getTime()
    return Math.max(
      Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1
    )
  }

  let count = 0
  const start = new Date(startDate + 'T12:00:00+07:00')
  const end = new Date(endDate + 'T12:00:00+07:00')

  const cursor = new Date(start)
  while (cursor <= end) {
    if (!restDays.includes(cursor.getDay())) {
      count++
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return Math.max(count, 1)
}

route.get('/', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: 'Parameter date wajib (YYYY-MM-DD)',
      }, 400)
    }

    const db = getDB(c.env)

    // Transactions today
    const txRows = await queryDB(db,
      `SELECT
        COALESCE(SUM(
          CASE WHEN type='income' THEN amount ELSE 0 END
        ), 0) as income,
        COALESCE(SUM(
          CASE WHEN type='expense' THEN amount ELSE 0 END
        ), 0) as expense,
        COALESCE(SUM(
          CASE WHEN type='debt_payment' THEN amount ELSE 0 END
        ), 0) as debt_payment,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE created_at LIKE ? AND is_deleted = 0`,
      [`${date}%`]
    )
    const tx = txRows[0] || {}
    const income = Number(tx.income) || 0
    const expense = Number(tx.expense) || 0
    const debtPayment = Number(tx.debt_payment) || 0
    const txCount =
      Number(tx.transaction_count) || 0

    const today: TodaySummary = {
      income,
      expense,
      debt_payment: debtPayment,
      profit: income - expense - debtPayment,
      transaction_count: txCount,
    }

    // Daily budget
    const dailyRows = await queryDB(db,
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM daily_expenses
       WHERE is_deleted = 0`
    )
    const dailyBudgetTotal =
      Number(dailyRows[0]?.total) || 0

    // Monthly expenses
    const monthlyRows = await queryDB(db,
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM monthly_expenses
       WHERE is_deleted = 0`
    )
    const totalMonthly =
      Number(monthlyRows[0]?.total) || 0
    const daysInMonth = getDaysInMonth(date)
    const proratedMonthly = totalMonthly > 0
      ? Math.round(totalMonthly / daysInMonth)
      : 0

    const budgetRemaining =
      dailyBudgetTotal - expense
    const pctUsed = dailyBudgetTotal > 0
      ? Math.round(
          (expense / dailyBudgetTotal) * 100
        )
      : 0

    const budget: BudgetInfo = {
      daily_total: dailyBudgetTotal,
      total_monthly: totalMonthly,
      spent_today: expense,
      remaining: budgetRemaining,
      percentage_used: pctUsed,
    }

    // Settings: target date + rest days
    const settRows = await queryDB(db,
      `SELECT key, value FROM settings
       WHERE key IN ('debt_target_date', 'rest_days')`
    )
    let targetDate = '2026-04-13'
    let restDaysRaw = '0'
    for (const row of settRows) {
      if (String(row.key) === 'debt_target_date') {
        targetDate = String(row.value)
      }
      if (String(row.key) === 'rest_days') {
        restDaysRaw = String(row.value)
      }
    }
    const restDays = parseRestDays(restDaysRaw)
    const todayIsRestDay = isRestDay(date, restDays)

    // Debt totals
    const debtRows = await queryDB(db,
      `SELECT
        COALESCE(SUM(total_original), 0) as total_original,
        COALESCE(SUM(total_remaining), 0) as total_remaining
      FROM debts
      WHERE is_deleted = 0 OR is_deleted IS NULL`
    )
    const debtAgg = debtRows[0] || {}
    const totalOriginal =
      Number(debtAgg.total_original) || 0
    const totalRemaining =
      Number(debtAgg.total_remaining) || 0
    const totalPaid = totalOriginal - totalRemaining
    const progressPct = totalOriginal > 0
      ? Math.round(
          (totalPaid / totalOriginal) * 100
        )
      : 0

    // Calendar days remaining
    const diffMs =
      new Date(targetDate).getTime() -
      new Date(date).getTime()
    const calendarDaysRemaining = Math.max(
      Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 1
    )

    // Working days remaining (tomorrow → target)
    const tomorrow = new Date(
      date + 'T12:00:00+07:00'
    )
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow
      .toISOString()
      .slice(0, 10)
    const workingDaysRem = countWorkingDays(
      tomorrowStr, targetDate, restDays
    )

    // Daily debt portion
    const dailyDebt = todayIsRestDay
      ? 0
      : Math.round(totalRemaining / workingDaysRem)

    // Target: 0 on rest day
    const targetAmount = todayIsRestDay
      ? 0
      : dailyBudgetTotal + proratedMonthly + dailyDebt
    const gap = todayIsRestDay
      ? income
      : income - targetAmount

    const daily_target: DailyTarget = {
      target_amount: targetAmount,
      earned_today: income,
      gap,
      is_on_track: todayIsRestDay
        ? true
        : gap >= 0,
      is_rest_day: todayIsRestDay,
      rest_days: restDays,
      breakdown: {
        daily_expense: dailyBudgetTotal,
        prorated_monthly: proratedMonthly,
        total_monthly: totalMonthly,
        daily_debt: dailyDebt,
        days_in_month: daysInMonth,
      },
      days_remaining: calendarDaysRemaining,
      working_days_remaining: workingDaysRem,
      target_date: targetDate,
    }

    // Upcoming dues
    const dueRows = await queryDB(db,
      `SELECT ds.debt_id, d.platform,
             ds.due_date, ds.amount
      FROM debt_schedule ds
      JOIN debts d ON ds.debt_id = d.id
      WHERE ds.status = 'unpaid'
        AND ds.due_date <= date(?, '+7 days')
        AND (d.is_deleted = 0
             OR d.is_deleted IS NULL)
      ORDER BY ds.due_date ASC`,
      [date]
    )

    const upcoming_dues: UpcomingDue[] =
      dueRows.map((row) => {
        const dueDate = String(row.due_date)
        const dMs =
          new Date(dueDate).getTime() -
          new Date(date).getTime()
        const daysUntil = Math.ceil(
          dMs / (1000 * 60 * 60 * 24)
        )
        return {
          debt_id: String(row.debt_id),
          platform: String(row.platform),
          due_date: dueDate,
          amount: Number(row.amount) || 0,
          days_until: daysUntil,
          urgency: getUrgency(daysUntil),
        }
      })

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
      daily_target,
      upcoming_dues,
      debt_summary,
    }

    return c.json<ApiResponse<DashboardData>>({
      success: true,
      data,
    })
  } catch (error) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Server error',
    }, 500)
  }
})

export { route as dashboardRoute }
