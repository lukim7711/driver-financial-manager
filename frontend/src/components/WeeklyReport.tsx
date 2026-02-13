import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah, formatDate } from '../lib/format'
import { WeeklyDayBar } from './WeeklyDayBar'

interface DayData {
  date: string
  day_name: string
  income: number
  expense: number
  debt_payment: number
  profit: number
  transaction_count: number
}

interface TopExpense {
  category: string
  emoji: string
  label: string
  total: number
  percentage: number
}

interface WeeklyData {
  week_start: string
  week_end: string
  active_days: number
  summary: {
    income: number
    expense: number
    debt_payment: number
    profit: number
    transaction_count: number
  }
  averages: {
    daily_income: number
    daily_expense: number
    daily_profit: number
  }
  comparison: {
    prev_week_start: string
    prev_week_end: string
    prev_income: number
    prev_expense: number
    prev_profit: number
    income_trend: number
    expense_trend: number
    profit_trend: number
  }
  daily: DayData[]
  top_expenses: TopExpense[]
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

function trendIcon(val: number): string {
  if (val > 5) return '⬆️'
  if (val < -5) return '⬇️'
  return '➡️'
}

function trendColor(val: number, inverse = false): string {
  const positive = inverse ? val < -5 : val > 5
  const negative = inverse ? val > 5 : val < -5
  if (positive) return 'text-emerald-600'
  if (negative) return 'text-red-600'
  return 'text-gray-500'
}

interface WeeklyReportProps {
  referenceDate: string
}

export function WeeklyReport({
  referenceDate,
}: WeeklyReportProps) {
  const [weekDate, setWeekDate] = useState(
    getMonday(referenceDate)
  )
  const [data, setData] = useState<WeeklyData | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  const fetchWeekly = useCallback(async (d: string) => {
    setLoading(true)
    const res = await apiClient<WeeklyData>(
      `/api/report/weekly?date=${d}`
    )
    if (res.success && res.data) setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchWeekly(weekDate)
  }, [weekDate, fetchWeekly])

  const today = getMonday(
    new Date().toISOString().slice(0, 10)
  )
  const canGoNext = weekDate < today

  const goBack = () =>
    setWeekDate(addDays(weekDate, -7))
  const goForward = () => {
    if (canGoNext) setWeekDate(addDays(weekDate, 7))
  }

  const weekEnd = addDays(weekDate, 6)
  const maxIncome = data
    ? Math.max(...data.daily.map((d) => d.income), 1)
    : 1

  const profitColor =
    (data?.summary.profit ?? 0) >= 0
      ? 'text-emerald-600'
      : 'text-red-600'

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-gray-400">
          Memuat ringkasan mingguan...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="tap-highlight-none rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 active:scale-95"
        >
          ← Minggu Lalu
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400">
            {formatDate(weekDate)} –{' '}
            {formatDate(weekEnd)}
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {data?.active_days ?? 0} hari aktif
          </p>
        </div>
        <button
          type="button"
          onClick={goForward}
          disabled={!canGoNext}
          className={`tap-highlight-none rounded-lg px-3 py-1.5 text-sm font-medium active:scale-95 ${
            canGoNext
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          Depan →
        </button>
      </div>

      {/* Weekly summary */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 mb-1">
          📊 Ringkasan Minggu Ini
        </h2>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            💰 Total Pemasukan
          </span>
          <span className="font-semibold text-emerald-600">
            {formatRupiah(data?.summary.income ?? 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            💸 Total Pengeluaran
          </span>
          <span className="font-semibold text-red-500">
            {formatRupiah(data?.summary.expense ?? 0)}
          </span>
        </div>
        {(data?.summary.debt_payment ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              💳 Bayar Hutang
            </span>
            <span className="font-semibold text-orange-500">
              {formatRupiah(
                data?.summary.debt_payment ?? 0
              )}
            </span>
          </div>
        )}
        <div className="border-t border-gray-100 pt-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">
              📈 Total Profit
            </span>
            <span
              className={`text-lg font-bold ${profitColor}`}
            >
              {formatRupiah(
                Math.abs(data?.summary.profit ?? 0)
              )}
              {(data?.summary.profit ?? 0) < 0
                ? ' ❌'
                : ' ✅'}
            </span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400">
          {data?.summary.transaction_count ?? 0} transaksi
        </p>
      </div>

      {/* Averages */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">
          📊 Rata-Rata Harian
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-emerald-600">
              {formatRupiah(
                data?.averages.daily_income ?? 0
              )}
            </p>
            <p className="text-xs text-gray-400">
              Pemasukan
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-red-500">
              {formatRupiah(
                data?.averages.daily_expense ?? 0
              )}
            </p>
            <p className="text-xs text-gray-400">
              Pengeluaran
            </p>
          </div>
          <div>
            <p
              className={`text-lg font-bold ${
                (data?.averages.daily_profit ?? 0) >= 0
                  ? 'text-emerald-600'
                  : 'text-red-500'
              }`}
            >
              {formatRupiah(
                Math.abs(
                  data?.averages.daily_profit ?? 0
                )
              )}
            </p>
            <p className="text-xs text-gray-400">
              Profit
            </p>
          </div>
        </div>
      </div>

      {/* Trend vs prev week */}
      {data?.comparison && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            📈 Tren vs Minggu Lalu
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Pemasukan
              </span>
              <span
                className={`text-sm font-semibold ${
                  trendColor(
                    data.comparison.income_trend
                  )
                }`}
              >
                {trendIcon(
                  data.comparison.income_trend
                )}{' '}
                {data.comparison.income_trend > 0
                  ? '+'
                  : ''}
                {data.comparison.income_trend}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Pengeluaran
              </span>
              <span
                className={`text-sm font-semibold ${
                  trendColor(
                    data.comparison.expense_trend,
                    true
                  )
                }`}
              >
                {trendIcon(
                  data.comparison.expense_trend
                )}{' '}
                {data.comparison.expense_trend > 0
                  ? '+'
                  : ''}
                {data.comparison.expense_trend}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Profit
              </span>
              <span
                className={`text-sm font-semibold ${
                  trendColor(
                    data.comparison.profit_trend
                  )
                }`}
              >
                {trendIcon(
                  data.comparison.profit_trend
                )}{' '}
                {data.comparison.profit_trend > 0
                  ? '+'
                  : ''}
                {data.comparison.profit_trend}%
              </span>
            </div>
            <p className="text-xs text-center text-gray-300">
              vs {formatDate(
                data.comparison.prev_week_start
              )} – {formatDate(
                data.comparison.prev_week_end
              )}
            </p>
          </div>
        </div>
      )}

      {/* Daily breakdown bars */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          📅 Per Hari
        </h2>
        <div className="space-y-2">
          {(data?.daily ?? []).map((day) => (
            <WeeklyDayBar
              key={day.date}
              day={day}
              maxIncome={maxIncome}
            />
          ))}
        </div>
      </div>

      {/* Top expenses */}
      {(data?.top_expenses ?? []).length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            💸 Top Pengeluaran
          </h2>
          <div className="space-y-2">
            {(data?.top_expenses ?? []).map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {cat.emoji}
                  </span>
                  <span className="text-sm text-gray-700">
                    {cat.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatRupiah(cat.total)}
                  </span>
                  <span className="ml-1 text-xs text-gray-400">
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
