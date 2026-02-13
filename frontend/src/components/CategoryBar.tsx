import { formatRupiah } from '../lib/format'

interface ExpenseCat {
  category: string
  emoji: string
  label: string
  spent: number
  budget: number
  percentage: number
}

interface CategoryBarProps {
  cat: ExpenseCat
}

function barColor(pct: number): string {
  if (pct > 100) return 'bg-red-500'
  if (pct === 100) return 'bg-orange-500'
  if (pct > 70) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

export function CategoryBar({ cat }: CategoryBarProps) {
  const hasBudget = cat.budget > 0
  const width = hasBudget ? Math.min(cat.percentage, 120) : (cat.spent > 0 ? 100 : 0)

  return (
    <div className="rounded-xl bg-white p-3 border border-gray-200">
      <div className="flex items-center justify-between text-sm">
        <span>
          {cat.emoji} {cat.label}
        </span>
        <span className="font-semibold text-gray-700">
          {formatRupiah(cat.spent)}
          {hasBudget && (
            <span className="text-gray-400"> / {formatRupiah(cat.budget)}</span>
          )}
        </span>
      </div>
      {hasBudget && (
        <>
          <div className="mt-1.5 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor(cat.percentage)}`}
              style={{ width: `${Math.min(width, 100)}%` }}
            />
          </div>
          <p className={`mt-0.5 text-right text-xs ${
            cat.percentage > 100 ? 'text-red-500 font-semibold' : 'text-gray-400'
          }`}>
            {cat.percentage}%{cat.percentage > 100 ? ' OVER!' : ''}
          </p>
        </>
      )}
    </div>
  )
}
