import { formatRupiah, formatTime } from '../lib/format'

const EMOJIS: Record<string, string> = {
  order: '🛵', tips: '💝', bonus: '🎁', insentif: '🏆',
  bbm: '⛽', makan: '🍜', rokok: '🚬', pulsa: '📱',
  parkir: '🅿️', service: '🔧', rt: '🏠', lainnya: '📦',
  debt: '💳',
}

interface Transaction {
  id: string
  created_at: string
  type: string
  amount: number
  category: string
  note: string
  source: string
  debt_id: string | null
}

interface TransactionItemProps {
  tx: Transaction
  onTap: () => void
}

export function TransactionItem({ tx, onTap }: TransactionItemProps) {
  const isIncome = tx.type === 'income'
  const isDebt = tx.type === 'debt_payment'
  const emoji = EMOJIS[tx.category] ?? '📦'
  const sign = isIncome ? '+' : '-'
  const color = isIncome ? 'text-emerald-600' : isDebt ? 'text-orange-500' : 'text-red-500'

  return (
    <button
      type="button"
      onClick={onTap}
      className="tap-highlight-none w-full rounded-xl bg-white p-3 border border-gray-200 text-left transition-all active:bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <div>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {tx.category}
            </span>
            {isDebt && (
              <span className="ml-1 text-xs text-orange-500">💳</span>
            )}
          </div>
        </div>
        <span className={`font-bold ${color}`}>
          {sign}{formatRupiah(tx.amount)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
        <span>{formatTime(tx.created_at)}</span>
        <span>•</span>
        <span>{tx.source}</span>
        {tx.note && (
          <>
            <span>•</span>
            <span className="truncate">{tx.note}</span>
          </>
        )}
      </div>
    </button>
  )
}
