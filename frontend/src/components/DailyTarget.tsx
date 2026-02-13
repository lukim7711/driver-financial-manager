import { formatRupiah } from '../lib/format'

interface DailyTargetProps {
  targetAmount: number
  earnedToday: number
  gap: number
  isOnTrack: boolean
  breakdown: {
    dailyExpense: number
    proratedMonthly: number
    dailyDebt: number
    daysInMonth: number
  }
  daysRemaining: number
}

export function DailyTarget({
  targetAmount,
  earnedToday,
  gap,
  isOnTrack,
  breakdown,
  daysRemaining,
}: DailyTargetProps) {
  const pctEarned = targetAmount > 0
    ? Math.min(
        Math.round((earnedToday / targetAmount) * 100),
        100
      )
    : 0

  return (
    <div className={`rounded-2xl border-2 p-4 space-y-3 ${
      isOnTrack
        ? 'border-emerald-200 bg-emerald-50'
        : 'border-orange-200 bg-orange-50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">
          \uD83C\uDFAF Target Hari Ini
        </span>
        <span className="text-xs text-gray-400">
          {daysRemaining} hari lagi
        </span>
      </div>

      {/* Target amount */}
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-800">
          {formatRupiah(targetAmount)}
        </p>
        <p className="text-xs text-gray-400">
          minimum penghasilan hari ini
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOnTrack
                ? 'bg-emerald-500'
                : pctEarned > 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${pctEarned}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">
            {pctEarned}% tercapai
          </span>
          <span className={`font-bold ${
            isOnTrack
              ? 'text-emerald-600'
              : 'text-red-600'
          }`}>
            {formatRupiah(earnedToday)}
          </span>
        </div>
      </div>

      {/* Gap indicator */}
      <div className={`rounded-xl px-3 py-2 text-center text-sm font-bold ${
        isOnTrack
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {isOnTrack
          ? `\u2705 Surplus ${formatRupiah(gap)}`
          : `\u26A0\uFE0F Kurang ${formatRupiah(Math.abs(gap))}`
        }
      </div>

      {/* Breakdown */}
      <div className="space-y-1 border-t border-gray-200 pt-2">
        <p className="text-xs font-semibold text-gray-400">
          Rincian target:
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>\uD83D\uDCB8 Pengeluaran harian</span>
          <span>{formatRupiah(breakdown.dailyExpense)}</span>
        </div>
        {breakdown.proratedMonthly > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              \uD83C\uDFE0 Bulanan \u00F7 {breakdown.daysInMonth}
            </span>
            <span>
              {formatRupiah(breakdown.proratedMonthly)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            \uD83D\uDCB3 Hutang \u00F7 {daysRemaining} hari
          </span>
          <span>{formatRupiah(breakdown.dailyDebt)}</span>
        </div>
      </div>
    </div>
  )
}
