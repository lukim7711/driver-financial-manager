import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'

interface WeekData {
  week_start: string
  week_end: string
  week_label: string
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

interface IncomeItem {
  category: string
  emoji: string
  label: string
  total: number
  count: number
}

interface MonthlyData {
  month: string
  month_label: string
  days_in_month: number
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
    prev_month: string
    prev_month_label: string
    prev_income: number
    prev_expense: number
    prev_profit: number
    income_trend: number
    expense_trend: number
    profit_trend: number
  }
  weekly: WeekData[]
  top_expenses: TopExpense[]
  income_breakdown: IncomeItem[]
}

function getCurrentMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

function trendIcon(val: number): string {
  if (val > 5) return '\u2b06\ufe0f'
  if (val < -5) return '\u2b07\ufe0f'
  return '\u27a1\ufe0f'
}

function trendColor(
  val: number, inverse = false
): string {
  const positive = inverse ? val < -5 : val > 5
  const negative = inverse ? val > 5 : val < -5
  if (positive) return 'text-emerald-600'
  if (negative) return 'text-red-600'
  return 'text-gray-500'
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function MonthlyReport() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [data, setData] = useState<MonthlyData | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  const fetchMonthly = useCallback(
    async (m: string) => {
      setLoading(true)
      const res = await apiClient<MonthlyData>(
        `/api/report/monthly?month=${m}`
      )
      if (res.success && res.data) setData(res.data)
      setLoading(false)
    }, []
  )

  useEffect(() => {
    void fetchMonthly(month)
  }, [month, fetchMonthly])

  const currentMonth = getCurrentMonth()
  const canGoNext = month < currentMonth

  const goBack = () => setMonth(shiftMonth(month, -1))
  const goForward = () => {
    if (canGoNext) setMonth(shiftMonth(month, 1))
  }

  const profitColor =
    (data?.summary.profit ?? 0) >= 0
      ? 'text-emerald-600'
      : 'text-red-600'

  const maxWeekIncome = data
    ? Math.max(...data.weekly.map((w) => w.income), 1)
    : 1

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-gray-400">
          Memuat ringkasan bulanan...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="tap-highlight-none rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 active:scale-95"
        >
          {'\u2190'} Bulan Lalu
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">
            {data?.month_label ?? month}
          </p>
          <p className="text-xs text-gray-400">
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
          Depan {'\u2192'}
        </button>
      </div>

      {/* Monthly summary */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 mb-1">
          {'\ud83d\udcca'} Ringkasan Bulan Ini
        </h2>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {'\ud83d\udcb0'} Total Pemasukan
          </span>
          <span className="font-semibold text-emerald-600">
            {formatRupiah(data?.summary.income ?? 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {'\ud83d\udcb8'} Total Pengeluaran
          </span>
          <span className="font-semibold text-red-500">
            {formatRupiah(data?.summary.expense ?? 0)}
          </span>
        </div>
        {(data?.summary.debt_payment ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              {'\ud83d\udcb3'} Bayar Hutang
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
              {'\ud83d\udcc8'} Total Profit
            </span>
            <span
              className={`text-lg font-bold ${profitColor}`}
            >
              {formatRupiah(
                Math.abs(data?.summary.profit ?? 0)
              )}
              {(data?.summary.profit ?? 0) < 0
                ? ' \u274c'
                : ' \u2705'}
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
          {'\ud83d\udcca'} Rata-Rata Harian
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

      {/* Trend vs prev month */}
      {data?.comparison && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            {'\ud83d\udcc8'} Tren vs Bulan Lalu
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
              vs {data.comparison.prev_month_label}
            </p>
          </div>
        </div>
      )}

      {/* Weekly breakdown */}
      {(data?.weekly ?? []).length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            {'\ud83d\udcc5'} Per Minggu
          </h2>
          <div className="space-y-3">
            {(data?.weekly ?? []).map((week) => {
              const barWidth = maxWeekIncome > 0
                ? Math.round(
                    (week.income / maxWeekIncome) * 100
                  )
                : 0
              const weekProfit = week.profit
              return (
                <div key={week.week_start}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {week.week_label}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">
                        {formatDateShort(
                          week.week_start
                        )} - {formatDateShort(
                          week.week_end
                        )}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        weekProfit >= 0
                          ? 'text-emerald-600'
                          : 'text-red-500'
                      }`}
                    >
                      {weekProfit >= 0 ? '+' : '-'}
                      {formatRupiah(
                        Math.abs(weekProfit)
                      )}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-400">
                      {'\ud83d\udcb0'}{' '}
                      {formatRupiah(week.income)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {'\ud83d\udcb8'}{' '}
                      {formatRupiah(week.expense)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top expenses */}
      {(data?.top_expenses ?? []).length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            {'\ud83d\udcb8'} Top Pengeluaran
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

      {/* Income breakdown */}
      {(data?.income_breakdown ?? []).length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            {'\ud83d\udcb0'} Sumber Pemasukan
          </h2>
          <div className="space-y-2">
            {(data?.income_breakdown ?? []).map((inc) => (
              <div
                key={inc.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {inc.emoji}
                  </span>
                  <span className="text-sm text-gray-700">
                    {inc.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-700">
                    {formatRupiah(inc.total)}
                  </span>
                  <span className="ml-1 text-xs text-gray-400">
                    {inc.count}x
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
