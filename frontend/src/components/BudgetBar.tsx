import { formatRupiah } from '../lib/format'

interface BudgetBarProps {
  totalDaily: number
  spentToday: number
  remaining: number
  percentageUsed: number
}

export function BudgetBar({
  totalDaily,
  remaining,
  percentageUsed,
}: BudgetBarProps) {
  const isOver = remaining < 0
  const barWidth = Math.min(percentageUsed, 100)
  const barColor = isOver
    ? 'bg-red-500'
    : percentageUsed > 80
      ? 'bg-yellow-500'
      : 'bg-emerald-500'

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          Sisa Budget Harian
        </span>
        <span
          className={`text-sm font-semibold ${
            isOver ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          {formatRupiah(Math.abs(remaining))}
          {isOver ? ' (OVER)' : ''}
        </span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>{percentageUsed}% terpakai</span>
        <span>dari {formatRupiah(totalDaily)}</span>
      </div>
    </div>
  )
}
