import { useNavigate } from 'react-router'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">💰 Money Manager</h1>
          <p className="text-sm text-gray-500">Driver Financial Dashboard</p>
        </div>

        {/* Quick action */}
        <button
          type="button"
          onClick={() => void navigate('/input')}
          className="tap-highlight-none w-full rounded-2xl bg-emerald-500 p-4 text-center text-lg font-bold text-white shadow-lg transition-all active:scale-95"
        >
          ➕ Catat Transaksi
        </button>

        {/* Placeholder cards */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500">Hari Ini</h2>
          <p className="mt-1 text-2xl font-bold text-gray-800">Rp 0</p>
          <p className="text-xs text-gray-400">Dashboard akan aktif di F004</p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          <NavButton emoji="🏠" label="Home" to="/" active />
          <NavButton emoji="💳" label="Hutang" to="/debts" />
          <NavButton emoji="📊" label="Laporan" to="/report" />
          <NavButton emoji="⚙️" label="Setting" to="/settings" />
        </div>
      </div>
    </div>
  )
}

function NavButton({ emoji, label, to, active }: {
  emoji: string
  label: string
  to: string
  active?: boolean
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => void navigate(to)}
      className={`tap-highlight-none flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition-all ${
        active ? 'text-emerald-600 font-semibold' : 'text-gray-400'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      {label}
    </button>
  )
}
