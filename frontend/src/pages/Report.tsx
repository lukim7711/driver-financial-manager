import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah, todayISO, formatDate } from '../lib/format'
import { CategoryBar } from '../components/CategoryBar'
import { TransactionItem } from '../components/TransactionItem'
import { EditTransaction } from '../components/EditTransaction'
import { BottomNav } from '../components/BottomNav'

interface ExpenseCat {
  category: string
  emoji: string
  label: string
  spent: number
  budget: number
  percentage: number
}

interface Transaction {
  id: string
  created_at: string
  type: string
  amount: number
  category: string
  note: string
  source: string
  debt_id: string | null
}

interface ReportData {
  date: string
  summary: {
    income: number
    expense: number
    debt_payment: number
    profit: number
    transaction_count: number
  }
  expense_by_category: ExpenseCat[]
  transactions: Transaction[]
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function Report() {
  const [date, setDate] = useState(todayISO())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const fetchReport = useCallback(async (d: string) => {
    setLoading(true)
    const res = await apiClient<ReportData>(`/api/report/daily?date=${d}`)
    if (res.success && res.data) setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchReport(date) }, [date, fetchReport])

  const today = todayISO()
  const canGoNext = date < today
  const profitColor = (data?.summary.profit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'

  const handleEditDone = () => {
    setEditTx(null)
    void fetchReport(date)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-purple-600 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">📊 Laporan Harian</h1>
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDate(shiftDate(date, -1))}
            className="tap-highlight-none rounded-lg bg-purple-700 px-3 py-1 text-sm"
          >
            ←
          </button>
          <span className="font-semibold">{formatDate(date)}</span>
          <button
            type="button"
            onClick={() => canGoNext && setDate(shiftDate(date, 1))}
            disabled={!canGoNext}
            className={`tap-highlight-none rounded-lg px-3 py-1 text-sm ${
              canGoNext ? 'bg-purple-700' : 'bg-purple-800 opacity-40'
            }`}
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-400">Memuat laporan...</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* Summary */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">💰 Pemasukan</span>
              <span className="font-semibold text-emerald-600">{formatRupiah(data?.summary.income ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">💸 Pengeluaran</span>
              <span className="font-semibold text-red-500">{formatRupiah(data?.summary.expense ?? 0)}</span>
            </div>
            {(data?.summary.debt_payment ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">💳 Bayar Hutang</span>
                <span className="font-semibold text-orange-500">{formatRupiah(data?.summary.debt_payment ?? 0)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">📈 Profit</span>
                <span className={`text-lg font-bold ${profitColor}`}>
                  {formatRupiah(Math.abs(data?.summary.profit ?? 0))}
                  {(data?.summary.profit ?? 0) < 0 ? ' ❌' : ' ✅'}
                </span>
              </div>
            </div>
          </div>

          {/* Expense by category */}
          {(data?.expense_by_category ?? []).some((c) => c.spent > 0 || c.budget > 0) && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-500">Pengeluaran per Kategori</h2>
              {(data?.expense_by_category ?? []).filter((c) => c.spent > 0 || c.budget > 0).map((cat) => (
                <CategoryBar key={cat.category} cat={cat} />
              ))}
            </div>
          )}

          {/* Transaction list */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">Riwayat Transaksi</h2>
            {(data?.transactions ?? []).length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                Belum ada transaksi pada tanggal ini
              </p>
            )}
            {(data?.transactions ?? []).map((tx) => (
              <TransactionItem key={tx.id} tx={tx} onTap={() => setEditTx(tx)} />
            ))}
            {(data?.summary.transaction_count ?? 0) > 0 && (
              <p className="text-center text-xs text-gray-400">
                {data?.summary.transaction_count} transaksi
              </p>
            )}
          </div>
        </div>
      )}

      {editTx && (
        <EditTransaction tx={editTx} onDone={handleEditDone} onCancel={() => setEditTx(null)} />
      )}

      <BottomNav active="report" />
    </div>
  )
}
