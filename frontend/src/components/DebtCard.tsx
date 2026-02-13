import { useState } from 'react'
import { formatRupiah } from '../lib/format'

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
  total_original: number
  total_remaining: number
  monthly_installment: number
  late_fee_type: string
  late_fee_rate: number
  total_installments: number
  paid_installments: number
  progress_percentage: number
  next_schedule: (Schedule & { days_until?: number | null }) | null
  schedules: Schedule[]
}

interface DebtCardProps {
  debt: Debt
  onPay: () => void
}

function getUrgencyStyle(daysUntil: number | null | undefined) {
  if (daysUntil === null || daysUntil === undefined) return { dot: '⚪', text: 'text-gray-500', bg: '' }
  if (daysUntil <= 0) return { dot: '🔴', text: 'text-red-700', bg: 'border-red-300' }
  if (daysUntil <= 3) return { dot: '🔴', text: 'text-red-600', bg: 'border-red-200' }
  if (daysUntil <= 7) return { dot: '🟡', text: 'text-yellow-700', bg: 'border-yellow-200' }
  return { dot: '⚪', text: 'text-gray-500', bg: '' }
}

function formatDueLabel(d: number | null | undefined): string {
  if (d === null || d === undefined) return ''
  if (d < 0) return `${Math.abs(d)} HARI TERLAMBAT!`
  if (d === 0) return 'HARI INI!'
  if (d === 1) return 'BESOK!'
  return `${d} hari lagi`
}

function formatShortDate(s: string): string {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })
}

function statusIcon(status: string): string {
  if (status === 'paid') return '✅'
  return '⬜'
}

export function DebtCard({ debt, onPay }: DebtCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLunas = debt.total_remaining <= 0
  const ns = debt.next_schedule
  const urgency = getUrgencyStyle(ns?.days_until)
  const feeLabel = debt.late_fee_type === 'pct_monthly'
    ? `${(debt.late_fee_rate * 100).toFixed(0)}%/bulan`
    : `${(debt.late_fee_rate * 100).toFixed(2)}%/hari`

  return (
    <div className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${
      isLunas ? 'border-emerald-200 opacity-75' : urgency.bg || 'border-gray-200'
    }`}>
      {/* Header — tap to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="tap-highlight-none w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{isLunas ? '✅' : urgency.dot}</span>
            <span className={`font-semibold ${
              isLunas ? 'text-emerald-600 line-through' : 'text-gray-800'
            }`}>
              {debt.platform}
            </span>
            {isLunas && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">LUNAS</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">Sisa: {formatRupiah(debt.total_remaining)}</span>
          <span className="text-xs text-gray-400">{debt.progress_percentage}%</span>
        </div>

        <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLunas ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(debt.progress_percentage, 100)}%` }}
          />
        </div>

        {ns && !isLunas && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Next: {formatShortDate(ns.due_date)} — {formatRupiah(ns.amount)}
            </span>
            <span className={`text-xs font-semibold ${urgency.text}`}>
              {formatDueLabel(ns.days_until)}
            </span>
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>Total Awal</span>
            <span className="text-right font-medium text-gray-700">{formatRupiah(debt.total_original)}</span>
            <span>Cicilan/bln</span>
            <span className="text-right font-medium text-gray-700">{formatRupiah(debt.monthly_installment)}</span>
            <span>Denda</span>
            <span className="text-right font-medium text-gray-700">{feeLabel}</span>
            <span>Progress</span>
            <span className="text-right font-medium text-gray-700">{debt.paid_installments}/{debt.total_installments}</span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Jadwal Cicilan</p>
            <div className="space-y-1">
              {debt.schedules.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatShortDate(s.due_date)}</span>
                  <span className="font-medium text-gray-700">{formatRupiah(s.amount)}</span>
                  <span>{statusIcon(s.status)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">⬜ Belum • ✅ Lunas</p>
          </div>

          {!isLunas && ns && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPay() }}
              className="tap-highlight-none mt-3 w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-95"
            >
              💳 Bayar Cicilan Berikut
            </button>
          )}
        </div>
      )}

      {/* Quick pay button (collapsed) */}
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
