import { formatRupiah } from '../lib/format'

interface SummaryCardProps {
  income: number
  expense: number
  debtPayment: number
  profit: number
  transactionCount: number
}

export function SummaryCard({ income, expense, debtPayment, profit }: SummaryCardProps) {
  const profitColor = profit >= 0 ? 'text-emerald-600' : 'text-red-600'
  const profitIcon = profit >= 0 ? '✅' : '❌'

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Pemasukan</span>
          <span className="font-semibold text-emerald-600">
            {formatRupiah(income)} ▲
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Pengeluaran</span>
          <span className="font-semibold text-red-500">
            {formatRupiah(expense)} ▼
          </span>
        </div>
        {debtPayment > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Bayar Hutang</span>
            <span className="font-semibold text-orange-500">
              {formatRupiah(debtPayment)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Profit</span>
            <span className={`text-lg font-bold ${profitColor}`}>
              {formatRupiah(Math.abs(profit))} {profitIcon}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
