import { useState, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah, todayISO } from '../lib/format'
import { useToast } from './Toast'

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

interface CustomData {
  start: string
  end: string
  total_days: number
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
  top_expenses: TopExpense[]
  income_breakdown: IncomeItem[]
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface PresetButton {
  label: string
  getRange: () => { start: string; end: string }
}

function getPresets(): PresetButton[] {
  const today = todayISO()
  return [
    {
      label: '7 Hari',
      getRange: () => ({
        start: addDays(today, -6), end: today,
      }),
    },
    {
      label: '14 Hari',
      getRange: () => ({
        start: addDays(today, -13), end: today,
      }),
    },
    {
      label: '30 Hari',
      getRange: () => ({
        start: addDays(today, -29), end: today,
      }),
    },
    {
      label: 'Bulan Ini',
      getRange: () => {
        const now = new Date()
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, '0')
        return { start: `${y}-${m}-01`, end: today }
      },
    },
  ]
}

export function CustomRangeReport() {
  const toast = useToast()
  const today = todayISO()
  const [startDate, setStartDate] = useState(
    addDays(today, -6)
  )
  const [endDate, setEndDate] = useState(today)
  const [data, setData] = useState<CustomData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCustom = useCallback(
    async (s: string, e: string) => {
      setLoading(true)
      const res = await apiClient<CustomData>(
        `/api/report/custom?start=${s}&end=${e}`
      )
      if (res.success && res.data) {
        setData(res.data)
      } else if (!res.success) {
        toast.error(res.error)
      }
      setLoading(false)
    }, [toast]
  )

  const handleApply = () => {
    if (startDate > endDate) {
      toast.error('Tanggal mulai harus sebelum akhir')
      return
    }
    if (endDate > today) {
      toast.error('Tidak bisa melewati hari ini')
      return
    }
    void fetchCustom(startDate, endDate)
  }

  const handlePreset = (preset: PresetButton) => {
    const { start, end } = preset.getRange()
    setStartDate(start)
    setEndDate(end)
    void fetchCustom(start, end)
  }

  const profitColor =
    (data?.summary.profit ?? 0) >= 0
      ? 'text-emerald-600'
      : 'text-red-600'

  return (
    <div className="space-y-4 p-4">
      {/* Date pickers */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">
          {'\ud83d\udcc5'} Pilih Rentang Tanggal
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Dari
            </label>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Sampai
            </label>
            <input
              type="date"
              value={endDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Preset buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {getPresets().map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p)}
              className="tap-highlight-none rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600 active:scale-95 active:bg-purple-100"
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="tap-highlight-none mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-50"
        >
          {loading
            ? '\u23f3 Memuat...'
            : '\ud83d\udd0d Tampilkan Laporan'}
        </button>
      </div>

      {/* No data yet */}
      {!data && !loading && (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-gray-400">
            Pilih rentang tanggal lalu tap Tampilkan
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex h-24 items-center justify-center">
          <p className="text-gray-400">
            Memuat laporan...
          </p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Range label */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {formatDateLabel(data.start)} {'\u2013'}{' '}
              {formatDateLabel(data.end)}
            </p>
            <p className="text-xs text-gray-400">
              {data.total_days} hari ({data.active_days}{' '}
              hari aktif)
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {'\ud83d\udcb0'} Pemasukan
              </span>
              <span className="font-semibold text-emerald-600">
                {formatRupiah(data.summary.income)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {'\ud83d\udcb8'} Pengeluaran
              </span>
              <span className="font-semibold text-red-500">
                {formatRupiah(data.summary.expense)}
              </span>
            </div>
            {data.summary.debt_payment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {'\ud83d\udcb3'} Bayar Hutang
                </span>
                <span className="font-semibold text-orange-500">
                  {formatRupiah(data.summary.debt_payment)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {'\ud83d\udcc8'} Profit
                </span>
                <span className={`text-lg font-bold ${profitColor}`}>
                  {formatRupiah(Math.abs(data.summary.profit))}
                  {data.summary.profit < 0 ? ' \u274c' : ' \u2705'}
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">
              {data.summary.transaction_count} transaksi
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
                  {formatRupiah(data.averages.daily_income)}
                </p>
                <p className="text-xs text-gray-400">
                  Pemasukan
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-500">
                  {formatRupiah(data.averages.daily_expense)}
                </p>
                <p className="text-xs text-gray-400">
                  Pengeluaran
                </p>
              </div>
              <div>
                <p className={`text-lg font-bold ${
                  data.averages.daily_profit >= 0
                    ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {formatRupiah(
                    Math.abs(data.averages.daily_profit)
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  Profit
                </p>
              </div>
            </div>
          </div>

          {/* Top expenses */}
          {data.top_expenses.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                {'\ud83d\udcb8'} Top Pengeluaran
              </h2>
              <div className="space-y-2">
                {data.top_expenses.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.emoji}</span>
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
          {data.income_breakdown.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                {'\ud83d\udcb0'} Sumber Pemasukan
              </h2>
              <div className="space-y-2">
                {data.income_breakdown.map((inc) => (
                  <div
                    key={inc.category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{inc.emoji}</span>
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
        </>
      )}
    </div>
  )
}
