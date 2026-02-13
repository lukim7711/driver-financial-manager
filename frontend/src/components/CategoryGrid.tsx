interface Category {
  id: string
  emoji: string
  label: string
}

const INCOME_CATEGORIES: Category[] = [
  { id: 'order', emoji: '🛵', label: 'Order' },
  { id: 'tips', emoji: '💝', label: 'Tips' },
  { id: 'bonus', emoji: '🎁', label: 'Bonus' },
  { id: 'insentif', emoji: '🏆', label: 'Insentif' },
  { id: 'lainnya_masuk', emoji: '📦', label: 'Lainnya' },
]

const EXPENSE_CATEGORIES: Category[] = [
  { id: 'bbm', emoji: '⛽', label: 'BBM' },
  { id: 'makan', emoji: '🍜', label: 'Makan' },
  { id: 'rokok', emoji: '🚬', label: 'Rokok' },
  { id: 'pulsa', emoji: '📱', label: 'Pulsa' },
  { id: 'parkir', emoji: '🅿️', label: 'Parkir' },
  { id: 'rt', emoji: '🏠', label: 'RT' },
  { id: 'service', emoji: '🔧', label: 'Service' },
  { id: 'lainnya_keluar', emoji: '📦', label: 'Lainnya' },
]

interface CategoryGridProps {
  type: 'income' | 'expense'
  onSelect: (categoryId: string) => void
}

export function CategoryGrid({ type, onSelect }: CategoryGridProps) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className="tap-highlight-none flex flex-col items-center gap-1 rounded-xl bg-white p-4 shadow-sm border border-gray-200 transition-all active:scale-95 active:bg-gray-50"
        >
          <span className="text-2xl">{cat.emoji}</span>
          <span className="text-xs font-medium text-gray-600">{cat.label}</span>
        </button>
      ))}
    </div>
  )
}

export { INCOME_CATEGORIES, EXPENSE_CATEGORIES }
export type { Category }
