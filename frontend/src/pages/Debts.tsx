import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { DebtCard } from '../components/DebtCard'
import { PayDialog } from '../components/PayDialog'
import { PaySuccess } from '../components/PaySuccess'
import { AddDebtForm } from '../components/AddDebtForm'
import { EditDebtDialog } from '../components/EditDebtDialog'
import {
  DeleteDebtDialog,
} from '../components/DeleteDebtDialog'
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
  debt_type?: string
  total_original: number
  total_remaining: number
  monthly_installment: number
  due_day: number
  late_fee_type: string
  late_fee_rate: number
  total_installments: number
  paid_installments: number
  progress_percentage: number
  note?: string
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
  const [data, setData] = useState<DebtData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [payTarget, setPayTarget] = useState<{
    debt: Debt
    schedule: Schedule
  } | null>(null)
  const [payResult, setPayResult] =
    useState<PayResult | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] =
    useState<Debt | null>(null)
  const [deleteTarget, setDeleteTarget] =
    useState<Debt | null>(null)

  const fetchDebts = useCallback(async () => {
    const res = await apiClient<DebtData>(
      '/api/debts'
    )
    if (res.success && res.data) setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchDebts()
  }, [fetchDebts])

  const handlePay = (debt: Debt) => {
    if (debt.debt_type === 'record') {
      // Record mode: create fake schedule
      setPayTarget({
        debt,
        schedule: {
          id: '',
          due_date: '',
          amount: debt.total_remaining,
          status: 'unpaid',
          paid_date: null,
          paid_amount: null,
        },
      })
      return
    }
    const sched = debt.next_schedule
    if (!sched) return
    setPayTarget({ debt, schedule: sched })
  }

  const handlePayConfirm = async (
    amount: number,
    isFull: boolean
  ) => {
    if (!payTarget) return
    const { debt, schedule } = payTarget
    const isRecord = debt.debt_type === 'record'
    const res = await apiClient<PayResult>(
      `/api/debts/${debt.id}/pay`,
      {
        method: 'POST',
        body: JSON.stringify({
          schedule_id: isRecord
            ? undefined
            : schedule.id,
          amount,
          is_full_payment: isFull,
        }),
      }
    )
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

  const handleAddSubmit = async (formData: {
    platform: string
    total_original: number
    note?: string
    late_fee_rate: number
    late_fee_type: string
    debt_type?: string
    schedules: Array<{
      due_date: string
      amount: number
    }>
  }) => {
    setSaving(true)
    const res = await apiClient<{ id: string }>(
      '/api/debts',
      {
        method: 'POST',
        body: JSON.stringify(formData),
      }
    )
    setSaving(false)
    if (res.success) {
      setShowAdd(false)
      void fetchDebts()
    }
  }

  const handleEditSubmit = async (updates: {
    platform?: string
    total_original?: number
    monthly_installment?: number
    due_day?: number
    late_fee_type?: string
    late_fee_rate?: number
    note?: string
  }) => {
    if (!editTarget) return
    setSaving(true)
    const res = await apiClient<unknown>(
      `/api/debts/${editTarget.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    )
    setSaving(false)
    if (res.success) {
      setEditTarget(null)
      void fetchDebts()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setSaving(true)
    const res = await apiClient<unknown>(
      `/api/debts/${deleteTarget.id}`,
      { method: 'DELETE' }
    )
    setSaving(false)
    if (res.success) {
      setDeleteTarget(null)
      void fetchDebts()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">
          Memuat data hutang...
        </p>
      </div>
    )
  }

  if (payResult) {
    return (
      <PaySuccess
        result={payResult}
        onDone={handleSuccessDone}
      />
    )
  }

  const summary = data?.summary ?? {
    total_original: 0,
    total_remaining: 0,
    total_paid: 0,
    progress_percentage: 0,
  }
  const debts = data?.debts ?? []
  const allPaid =
    summary.total_remaining <= 0 &&
    summary.total_paid > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-blue-600 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">
          {"\ud83d\udcb3"} Status Hutang
        </h1>
        <p className="mt-2 text-2xl font-bold">
          {formatRupiah(summary.total_remaining)}
        </p>
        <div className="mt-2 h-3 rounded-full bg-blue-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{
              width: `${Math.min(
                summary.progress_percentage,
                100
              )}%`,
            }}
          />
        </div>
        <p className="mt-1 text-xs text-blue-200">
          {summary.progress_percentage}% lunas {"\u2022"}{' '}
          {formatRupiah(summary.total_paid)} terbayar
        </p>
      </div>

      <div className="space-y-3 p-4">
        {allPaid && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <p className="text-3xl">{"\ud83c\udf89"}</p>
            <p className="mt-2 text-lg font-bold text-emerald-700">
              Semua Hutang LUNAS!
            </p>
          </div>
        )}

        {debts.map((debt) => (
          <DebtCard
            key={debt.id}
            debt={debt}
            onPay={() => handlePay(debt)}
            onEdit={() => setEditTarget(debt)}
            onDelete={() =>
              setDeleteTarget(debt)
            }
            onRefresh={() => void fetchDebts()}
          />
        ))}

        {debts.length === 0 && !allPaid && (
          <div className="rounded-2xl bg-gray-100 p-6 text-center">
            <p className="text-3xl">{"\ud83d\udcad"}</p>
            <p className="mt-2 text-sm text-gray-500">
              Belum ada hutang. Tap + untuk
              menambah.
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-2xl text-white shadow-lg transition-all active:scale-90"
        aria-label="Tambah Hutang"
      >
        +
      </button>

      {/* Dialogs */}
      {showAdd && (
        <AddDebtForm
          onSubmit={handleAddSubmit}
          onCancel={() => setShowAdd(false)}
          loading={saving}
        />
      )}

      {editTarget && (
        <EditDebtDialog
          debt={editTarget}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditTarget(null)}
          loading={saving}
        />
      )}

      {deleteTarget && (
        <DeleteDebtDialog
          platform={deleteTarget.platform}
          totalRemaining={
            deleteTarget.total_remaining
          }
          onConfirm={() =>
            void handleDeleteConfirm()
          }
          onCancel={() => setDeleteTarget(null)}
          loading={saving}
        />
      )}

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
