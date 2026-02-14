import { formatRupiah } from '../lib/format'

interface DailyTargetProps {
  targetAmount: number
  earnedToday: number
  gap: number
  isOnTrack: boolean
  isRestDay: boolean
  breakdown: {
    dailyExpense: number
    proratedMonthly: number
    dailyDebt: number
    daysInMonth: number
  }
  daysRemaining: number
  workingDaysRemaining: number
}

export function DailyTarget({
  targetAmount,
  earnedToday,
  gap,
  isOnTrack,
  isRestDay,
  breakdown,
  daysRemaining,
  workingDaysRemaining,
}: DailyTargetProps) {
  // === REST DAY VIEW ===
  if (isRestDay) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-3">
        <div className="text-center space-y-1">
          <p className="text-3xl">
            {'\ud83c\udf19'}
          </p>
          <p className="text-lg font-bold text-indigo-700">
            Hari Libur
          </p>
          <p className="text-sm text-indigo-400">
            Istirahat yang cukup!
          </p>
        </div>

        {earnedToday > 0 && (
          <div className="rounded-xl bg-emerald-100 px-3 py-2 text-center">
            <p className="text-sm font-bold text-emerald-700">
              {'\ud83c\udf89'} Bonus hari ini:{' '}
              {formatRupiah(earnedToday)}
            </p>
            <p className="text-xs text-emerald-500">
              Pemasukan ini mengurangi target
              hari kerja berikutnya
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
          <span className="text-xs text-gray-500">
            {'\u23f3'} Sisa hari ke target
          </span>
          <span className="text-xs font-bold text-gray-600">
            {daysRemaining} hari
            ({workingDaysRemaining} hari kerja)
          </span>
        </div>
      </div>
    )
  }

  // === WORKING DAY VIEW ===
  const pctEarned = targetAmount > 0
    ? Math.min(
        Math.round(
          (earnedToday / targetAmount) * 100
        ),
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
          {'\ud83c\udfaf'} Target Hari Ini
        </span>
        <span className="text-xs text-gray-400">
          {workingDaysRemaining} hari kerja lagi
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
          : `\u26a0\ufe0f Kurang ${formatRupiah(Math.abs(gap))}`
        }
      </div>

      {/* Breakdown */}
      <div className="space-y-1 border-t border-gray-200 pt-2">
        <p className="text-xs font-semibold text-gray-400">
          Rincian target:
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {'\ud83d\udcb8'} Pengeluaran harian
          </span>
          <span>
            {formatRupiah(breakdown.dailyExpense)}
          </span>
        </div>
        {breakdown.proratedMonthly > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {'\ud83c\udfe0'} Bulanan {'\u00f7'}{' '}
              {breakdown.daysInMonth}
            </span>
            <span>
              {formatRupiah(
                breakdown.proratedMonthly
              )}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {'\ud83d\udcb3'} Hutang {'\u00f7'}{' '}
            {workingDaysRemaining} hari kerja
          </span>
          <span>
            {formatRupiah(breakdown.dailyDebt)}
          </span>
        </div>
      </div>
    </div>
  )
}
