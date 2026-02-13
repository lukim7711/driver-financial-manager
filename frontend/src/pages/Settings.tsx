import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { BottomNav } from '../components/BottomNav'

interface BudgetData {
  budget_bbm: number
  budget_makan: number
  budget_rokok: number
  budget_pulsa: number
  budget_rt: number
  daily_total: number
  monthly_rt: number
}

interface BudgetField {
  key: keyof BudgetData
  emoji: string
  label: string
  hint: string
}

const DAILY_FIELDS: BudgetField[] = [
  { key: 'budget_bbm', emoji: '⛽', label: 'BBM', hint: 'Per hari' },
  { key: 'budget_makan', emoji: '🍜', label: 'Makan', hint: 'Per hari' },
  { key: 'budget_rokok', emoji: '🚬', label: 'Rokok', hint: 'Per hari' },
  { key: 'budget_pulsa', emoji: '📱', label: 'Pulsa', hint: 'Per hari' },
]

const MONTHLY_FIELDS: BudgetField[] = [
  { key: 'budget_rt', emoji: '🏠', label: 'RT/Rumah Tangga', hint: 'Per bulan' },
]

export function Settings() {
  const [data, setData] = useState<BudgetData | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const res = await apiClient<BudgetData>('/api/settings')
    if (res.success) {
      setData(res.data)
      setEdits({})
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchSettings() }, [fetchSettings])

  const handleChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const getValue = (key: keyof BudgetData): string => {
    if (key in edits) return edits[key]!
    return String(data?.[key] ?? 0)
  }

  const dailyTotal = DAILY_FIELDS.reduce((sum, f) => {
    return sum + (parseInt(getValue(f.key), 10) || 0)
  }, 0)

  const hasChanges = Object.keys(edits).length > 0

  const handleSave = async () => {
    if (!hasChanges || saving) return
    setSaving(true)
    setError(null)

    const payload: Record<string, number> = {}
    for (const [key, val] of Object.entries(edits)) {
      const num = parseInt(val, 10)
      if (isNaN(num) || num < 0) {
        setError(`${key}: harus angka >= 0`)
        setSaving(false)
        return
      }
      payload[key] = num
    }

    const res = await apiClient<BudgetData>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (res.success) {
      setData(res.data)
      setEdits({})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError(res.error || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  const renderField = (field: BudgetField) => (
    <div key={field.key} className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{field.emoji}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">{field.label}</p>
          <p className="text-xs text-gray-400">{field.hint}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={getValue(field.key)}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gray-800 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">⚙️ Pengaturan</h1>
        <p className="text-sm text-gray-400">Atur budget harian & bulanan</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-400">Memuat pengaturan...</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* Daily budgets */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">Budget Harian</h2>
            {DAILY_FIELDS.map(renderField)}
            <div className="flex justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">Total Harian</span>
              <span className="text-sm font-bold text-emerald-700">{formatRupiah(dailyTotal)}</span>
            </div>
          </div>

          {/* Monthly budgets */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">Budget Bulanan</h2>
            {MONTHLY_FIELDS.map(renderField)}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Save */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasChanges || saving}
            className={`tap-highlight-none w-full rounded-xl py-4 text-center text-lg font-bold transition-all active:scale-95 ${
              saved
                ? 'bg-emerald-500 text-white'
                : hasChanges
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-400'
            }`}
          >
            {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Pengaturan'}
          </button>

          {/* App info */}
          <div className="text-center space-y-1 pt-4">
            <p className="text-xs text-gray-400">Money Manager v1.0.0</p>
            <p className="text-xs text-gray-300">Driver Ojol Financial Dashboard</p>
          </div>
        </div>
      )}

      <BottomNav active="settings" />
    </div>
  )
}
