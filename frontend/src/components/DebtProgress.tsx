import { formatRupiah } from '../lib/format'

interface DebtProgressProps {
  totalOriginal: number
  totalRemaining: number
  totalPaid: number
  progressPercentage: number
  targetDate: string
}

export function DebtProgress({
  totalRemaining,
  totalPaid,
  progressPercentage,
  targetDate,
}: DebtProgressProps) {
  const allPaid = totalRemaining === 0 && totalPaid > 0

  if (allPaid) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
        <p className="text-2xl">🎉</p>
        <p className="text-lg font-bold text-emerald-700">Semua Hutang LUNAS!</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-500">Total Hutang</span>
        <span className="text-lg font-bold text-gray-800">
          {formatRupiah(totalRemaining)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>{progressPercentage}% lunas</span>
        {targetDate && (
          <span>Target: {new Date(targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        )}
      </div>
    </div>
  )
}
