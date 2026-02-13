import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { DebtCard } from '../components/DebtCard'
import { PayDialog } from '../components/PayDialog'
import { PaySuccess } from '../components/PaySuccess'
import { BottomNav } from '../components/BottomNav'

interface Schedule {
  id: string
  due_date: string
  amount: number
  status: string
  paid_date: string | null
  paid_amount: number | null
  days_until?: number | null
}

interface Debt {
  id: string
  platform: string
  total_original: number
  total_remaining: number
  monthly_installment: number
  due_day: number
  late_fee_type: string
  late_fee_rate: number
  total_installments: number
  paid_installments: number
  progress_percentage: number
  next_schedule: Schedule | null
  schedules: Schedule[]
}

interface DebtData {
  summary: {
    total_original: number
    total_remaining: number
    total_paid: number
    progress_percentage: number
  }
  debts: Debt[]
}

interface PayResult {
  platform: string
  paid_amount: number
  remaining: number
  is_fully_paid: boolean
}

export function Debts() {
  const [data, setData] = useState<DebtData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payTarget, setPayTarget] = useState<{ debt: Debt; schedule: Schedule } | null>(null)
  const [payResult, setPayResult] = useState<PayResult | null>(null)

  const fetchDebts = useCallback(async () => {
    const res = await apiClient<DebtData>('/api/debts')
    if (res.success && res.data) setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { void fetchDebts() }, [fetchDebts])

  const handlePay = (debt: Debt) => {
    const sched = debt.next_schedule
    if (!sched) return
    setPayTarget({ debt, schedule: sched })
  }

  const handlePayConfirm = async (amount: number, isFull: boolean) => {
    if (!payTarget) return
    const { debt, schedule } = payTarget
    const res = await apiClient<PayResult>(`/api/debts/${debt.id}/pay`, {
      method: 'POST',
      body: JSON.stringify({
        schedule_id: schedule.id,
        amount,
        is_full_payment: isFull,
      }),
    })
    if (res.success && res.data) {
      setPayTarget(null)
      setPayResult(res.data)
    }
    return res
  }

  const handleSuccessDone = () => {
    setPayResult(null)
    void fetchDebts()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">Memuat data hutang...</p>
      </div>
    )
  }

  if (payResult) {
    return <PaySuccess result={payResult} onDone={handleSuccessDone} />
  }

  const summary = data?.summary ?? { total_original: 0, total_remaining: 0, total_paid: 0, progress_percentage: 0 }
  const debts = data?.debts ?? []
  const allPaid = summary.total_remaining <= 0 && summary.total_paid > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">💳 Status Hutang</h1>
        <p className="mt-2 text-2xl font-bold">{formatRupiah(summary.total_remaining)}</p>
        <div className="mt-2 h-3 rounded-full bg-blue-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(summary.progress_percentage, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-blue-200">
          {summary.progress_percentage}% lunas • {formatRupiah(summary.total_paid)} terbayar
        </p>
      </div>

      <div className="space-y-3 p-4">
        {allPaid && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-2 text-lg font-bold text-emerald-700">Semua Hutang LUNAS!</p>
          </div>
        )}

        {debts.map((debt) => (
          <DebtCard key={debt.id} debt={debt} onPay={() => handlePay(debt)} />
        ))}
      </div>

      {payTarget && (
        <PayDialog
          debt={payTarget.debt}
          schedule={payTarget.schedule}
          onConfirm={handlePayConfirm}
          onCancel={() => setPayTarget(null)}
        />
      )}

      <BottomNav active="debts" />
    </div>
  )
}
