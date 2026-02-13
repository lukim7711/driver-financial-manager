import { useNavigate } from 'react-router'

interface NavItem {
  id: string
  emoji: string
  label: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', emoji: '🏠', label: 'Home', path: '/' },
  { id: 'input', emoji: '➕', label: 'Catat', path: '/input' },
  { id: 'debts', emoji: '💳', label: 'Hutang', path: '/debts' },
  { id: 'report', emoji: '📊', label: 'Laporan', path: '/report' },
  { id: 'settings', emoji: '⚙️', label: 'Setting', path: '/settings' },
]

interface BottomNavProps {
  active: string
}

export function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-2 py-2">
      <div className="mx-auto flex max-w-md justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active
          const isInput = item.id === 'input'

          if (isInput) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => void navigate(item.path)}
                className="tap-highlight-none -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-lg transition-all active:scale-90"
              >
                {item.emoji}
              </button>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => void navigate(item.path)}
              className={`tap-highlight-none flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
