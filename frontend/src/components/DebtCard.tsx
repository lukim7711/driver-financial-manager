import { useState } from 'react'
import { formatRupiah } from '../lib/format'
import { apiClient } from '../lib/api'

interface Schedule {
  id: string
  due_date: string
  amount: number
  status: string
  paid_date: string | null
  paid_amount: number | null
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
  next_schedule:
    | (Schedule & { days_until?: number | null })
    | null
  schedules: Schedule[]
}

interface DebtCardProps {
  debt: Debt
  onPay: () => void
  onEdit: () => void
  onDelete: () => void
  onRefresh?: () => void
}

function getUrgencyStyle(
  daysUntil: number | null | undefined
) {
  if (daysUntil === null || daysUntil === undefined)
    return { dot: '⚪', text: 'text-gray-500', bg: '' }
  if (daysUntil <= 0)
    return {
      dot: '🔴',
      text: 'text-red-700',
      bg: 'border-red-300',
    }
  if (daysUntil <= 3)
    return {
      dot: '🔴',
      text: 'text-red-600',
      bg: 'border-red-200',
    }
  if (daysUntil <= 7)
    return {
      dot: '🟡',
      text: 'text-yellow-700',
      bg: 'border-yellow-200',
    }
  return { dot: '⚪', text: 'text-gray-500', bg: '' }
}

function formatDueLabel(
  d: number | null | undefined
): string {
  if (d === null || d === undefined) return ''
  if (d < 0) return `${Math.abs(d)} HARI TERLAMBAT!`
  if (d === 0) return 'HARI INI!'
  if (d === 1) return 'BESOK!'
  return `${d} hari lagi`
}

function formatShortDate(s: string): string {
  return new Date(s).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

function statusIcon(status: string): string {
  return status === 'paid' ? '✅' : '⬜'
}

export function DebtCard({
  debt,
  onPay,
  onEdit,
  onDelete,
  onRefresh,
}: DebtCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<
    string | null
  >(null)
  const [editAmount, setEditAmount] = useState('')
  const [saving, setSaving] = useState(false)

  const isLunas = debt.total_remaining <= 0
  const isSimple = debt.debt_type === 'simple'
  const ns = debt.next_schedule
  const urgency = getUrgencyStyle(ns?.days_until)
  const feeLabel =
    debt.late_fee_type === 'pct_monthly'
      ? `${(debt.late_fee_rate * 100).toFixed(0)}%/bln`
      : `${(debt.late_fee_rate * 100).toFixed(2)}%/hr`

  const handleEditSchedule = (
    s: Schedule
  ) => {
    if (s.status === 'paid') return
    setEditingId(s.id)
    setEditAmount(String(s.amount))
  }

  const handleSaveSchedule = async (
    sid: string
  ) => {
    const amt = parseInt(editAmount, 10)
    if (!amt || amt <= 0) return
    setSaving(true)
    const res = await apiClient<{
      schedule_id: string
      updated: boolean
    }>(
      `/api/debts/${debt.id}/schedules/${sid}`,
      {
        method: 'PUT',
        body: JSON.stringify({ amount: amt }),
      }
    )
    setSaving(false)
    if (res.success) {
      setEditingId(null)
      onRefresh?.()
    }
  }

  // Find if last unpaid schedule has different amount
  const unpaidSchedules = debt.schedules.filter(
    (s) => s.status === 'unpaid'
  )
  const lastUnpaid =
    unpaidSchedules[unpaidSchedules.length - 1]
  const isLastDifferent =
    lastUnpaid &&
    unpaidSchedules.length > 1 &&
    lastUnpaid.amount !==
      unpaidSchedules[0]!.amount

  return (
    <div
      className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${
        isLunas
          ? 'border-emerald-200 opacity-75'
          : urgency.bg || 'border-gray-200'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="tap-highlight-none w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>
              {isLunas
                ? '✅'
                : isSimple
                  ? '🤝'
                  : urgency.dot}
            </span>
            <span
              className={`font-semibold ${
                isLunas
                  ? 'text-emerald-600 line-through'
                  : 'text-gray-800'
              }`}
            >
              {debt.platform}
            </span>
            {isLunas && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                LUNAS
              </span>
            )}
            {isSimple && !isLunas && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                Pinjaman
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {expanded ? '▲' : '▼'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {isSimple ? 'Pinjaman' : 'Sisa'}:{' '}
            {formatRupiah(debt.total_remaining)}
          </span>
          <span className="text-xs text-gray-400">
            {debt.progress_percentage}%
          </span>
        </div>

        <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLunas
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{
              width: `${Math.min(
                debt.progress_percentage,
                100
              )}%`,
            }}
          />
        </div>

        {ns && !isLunas && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {isSimple ? 'Bayar' : 'Next'}:{' '}
              {formatShortDate(ns.due_date)} —{' '}
              {formatRupiah(ns.amount)}
            </span>
            <span
              className={`text-xs font-semibold ${urgency.text}`}
            >
              {formatDueLabel(ns.days_until)}
            </span>
          </div>
        )}

        {/* Simple loan note */}
        {isSimple && debt.note && !expanded && (
          <p className="mt-1 text-xs text-gray-400 truncate">
            📝 {debt.note}
          </p>
        )}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          {/* Note for simple */}
          {isSimple && debt.note && (
            <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              📝 {debt.note}
            </p>
          )}

          {/* Details grid */}
          {!isSimple && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>Total Awal</span>
              <span className="text-right font-medium text-gray-700">
                {formatRupiah(debt.total_original)}
              </span>
              <span>Cicilan/bln</span>
              <span className="text-right font-medium text-gray-700">
                {formatRupiah(
                  debt.monthly_installment
                )}
              </span>
              <span>Denda</span>
              <span className="text-right font-medium text-gray-700">
                {feeLabel}
              </span>
              <span>Progress</span>
              <span className="text-right font-medium text-gray-700">
                {debt.paid_installments}/
                {debt.total_installments}
              </span>
            </div>
          )}

          {/* Schedules — tap to edit */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              {isSimple
                ? 'Jadwal Bayar'
                : 'Jadwal Cicilan'}
              {!isSimple && (
                <span className="ml-1 font-normal text-gray-400">
                  (tap nominal utk edit)
                </span>
              )}
            </p>
            <div className="space-y-1">
              {debt.schedules.map((s) => {
                const isEditing =
                  editingId === s.id
                const isLast =
                  s.id === lastUnpaid?.id &&
                  isLastDifferent

                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <span className="text-gray-500 whitespace-nowrap">
                      {formatShortDate(s.due_date)}
                    </span>

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={editAmount}
                          onChange={(e) =>
                            setEditAmount(
                              e.target.value
                            )
                          }
                          className="w-24 rounded-lg border border-blue-300 px-2 py-1 text-xs text-right focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() =>
                            void handleSaveSchedule(
                              s.id
                            )
                          }
                          disabled={saving}
                          className="text-blue-500 font-bold"
                        >
                          {saving
                            ? '⏳'
                            : '✔️'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(null)
                          }
                          className="text-gray-400"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleEditSchedule(s)
                        }
                        disabled={
                          s.status === 'paid'
                        }
                        className={`font-medium ${
                          s.status === 'paid'
                            ? 'text-gray-400'
                            : isLast
                              ? 'text-amber-600 underline decoration-dashed'
                              : 'text-gray-700 underline decoration-dashed decoration-gray-300'
                        }`}
                      >
                        {formatRupiah(s.amount)}
                        {isLast && ' ⚡'}
                      </button>
                    )}

                    <span>
                      {statusIcon(s.status)}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              ⬜ Belum • ✅ Lunas
              {!isSimple && (
                <span>
                  {' '}
                  • ⚡ Sisa terakhir
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            {!isLunas && ns && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPay()
                }}
                className="tap-highlight-none flex-1 rounded-xl bg-blue-500 py-2.5 text-center text-sm font-bold text-white transition-all active:scale-95"
              >
                💳 Bayar
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="tap-highlight-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all active:scale-95"
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="tap-highlight-none rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-all active:scale-95"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Quick pay (collapsed) */}
      {!expanded && !isLunas && ns && (
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onPay}
            className="tap-highlight-none w-full rounded-xl bg-blue-500 py-2.5 text-center text-sm font-bold text-white transition-all active:scale-95"
          >
            💳 Bayar
          </button>
        </div>
      )}
    </div>
  )
}
