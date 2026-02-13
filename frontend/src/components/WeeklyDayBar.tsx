import { formatRupiah } from '../lib/format'

interface DayData {
  date: string
  day_name: string
  income: number
  expense: number
  debt_payment: number
  profit: number
  transaction_count: number
}

interface WeeklyDayBarProps {
  day: DayData
  maxIncome: number
}

export function WeeklyDayBar({
  day,
  maxIncome,
}: WeeklyDayBarProps) {
  const incomeWidth = maxIncome > 0
    ? Math.round((day.income / maxIncome) * 100)
    : 0
  const expenseWidth = maxIncome > 0
    ? Math.round((day.expense / maxIncome) * 100)
    : 0

  const isToday =
    day.date ===
    new Date(
      new Date().getTime() + 7 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10)

  const profitColor =
    day.profit >= 0 ? 'text-emerald-600' : 'text-red-500'

  return (
    <div
      className={`rounded-lg p-2 ${
        isToday
          ? 'bg-purple-50 border border-purple-200'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-600 w-12">
            {day.day_name.slice(0, 3)}
          </span>
          {isToday && (
            <span className="rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              HARI INI
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold ${profitColor}`}>
          {day.profit >= 0 ? '+' : '-'}
          {formatRupiah(Math.abs(day.profit))}
        </span>
      </div>

      {day.transaction_count > 0 ? (
        <div className="space-y-0.5">
          {/* Income bar */}
          <div className="flex items-center gap-1">
            <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{
                  width: `${Math.max(incomeWidth, 2)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-emerald-600 w-16 text-right">
              {formatRupiah(day.income)}
            </span>
          </div>
          {/* Expense bar */}
          <div className="flex items-center gap-1">
            <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-400 transition-all duration-300"
                style={{
                  width: `${Math.max(expenseWidth, 2)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-red-500 w-16 text-right">
              {formatRupiah(day.expense)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-gray-300">
          Tidak ada transaksi
        </p>
      )}
    </div>
  )
}
