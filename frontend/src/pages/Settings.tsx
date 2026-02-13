import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { BottomNav } from '../components/BottomNav'
import type { MonthlyExpense } from '../types'

interface SettingsData {
  budget_bbm: number
  budget_makan: number
  budget_rokok: number
  budget_pulsa: number
  daily_total: number
  debt_target_date: string
}

interface MonthlyExpensesData {
  items: MonthlyExpense[]
  total: number
}

interface BudgetField {
  key: string
  emoji: string
  label: string
  hint: string
}

const DAILY_FIELDS: BudgetField[] = [
  { key: 'budget_bbm', emoji: '⛽', label: 'BBM', hint: 'Per hari' },
  { key: 'budget_makan', emoji: '🍜', label: 'Makan', hint: 'Per hari' },
  { key: 'budget_rokok', emoji: '🚭', label: 'Rokok', hint: 'Per hari' },
  { key: 'budget_pulsa', emoji: '📱', label: 'Pulsa', hint: 'Per hari' },
]

const EMOJI_OPTIONS = [
  '🏠', '💡', '💧', '📶', '🔌', '🏥', '🎓',
  '📺', '🚗', '🛡️', '📦', '🧹', '👶', '🐾',
]

function formatDateDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00+07:00')
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getDaysFromNow(dateStr: string): number {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  const today = local.toISOString().slice(0, 10)
  const diffMs =
    new Date(dateStr).getTime() - new Date(today).getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function Settings() {
  const [data, setData] = useState<SettingsData | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Monthly expenses state
  const [monthlyItems, setMonthlyItems] = useState<
    MonthlyExpense[]
  >([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📦')
  const [newAmount, setNewAmount] = useState('')
  const [monthlyEdits, setMonthlyEdits] = useState<
    Record<string, string>
  >({})
  const [savingMonthly, setSavingMonthly] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const [settingsRes, monthlyRes] = await Promise.all([
      apiClient<SettingsData>('/api/settings'),
      apiClient<MonthlyExpensesData>('/api/monthly-expenses'),
    ])
    if (settingsRes.success && settingsRes.data) {
      setData(settingsRes.data)
      setEdits({})
    }
    if (monthlyRes.success && monthlyRes.data) {
      setMonthlyItems(monthlyRes.data.items)
      setMonthlyTotal(monthlyRes.data.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const handleChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const getBudgetValue = (key: string): string => {
    if (key in edits) return edits[key]!
    const val = data?.[key as keyof SettingsData]
    return String(val ?? 0)
  }

  const getTargetDate = (): string => {
    if ('debt_target_date' in edits)
      return edits['debt_target_date']!
    return data?.debt_target_date ?? '2026-04-13'
  }

  const dailyTotal = DAILY_FIELDS.reduce((sum, f) => {
    return sum + (parseInt(getBudgetValue(f.key), 10) || 0)
  }, 0)

  const hasChanges = Object.keys(edits).length > 0

  const handleSave = async () => {
    if (!hasChanges || saving) return
    setSaving(true)
    setError(null)

    const payload: Record<string, number | string> = {}
    for (const [key, val] of Object.entries(edits)) {
      if (key === 'debt_target_date') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          setError('Format tanggal tidak valid')
          setSaving(false)
          return
        }
        payload[key] = val
      } else {
        const num = parseInt(val, 10)
        if (isNaN(num) || num < 0) {
          setError(`${key}: harus angka >= 0`)
          setSaving(false)
          return
        }
        payload[key] = num
      }
    }

    const res = await apiClient<SettingsData>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (res.success && res.data) {
      setData(res.data)
      setEdits({})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menyimpan')
    }
    setSaving(false)
  }

  // Monthly expense handlers
  const handleAddMonthly = async () => {
    if (!newName.trim() || savingMonthly) return
    const amount = parseInt(newAmount, 10)
    if (isNaN(amount) || amount < 0) {
      setError('Nominal harus angka >= 0')
      return
    }
    setSavingMonthly(true)
    setError(null)

    const res = await apiClient<MonthlyExpense>(
      '/api/monthly-expenses',
      {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          emoji: newEmoji,
          amount,
        }),
      }
    )

    if (res.success && res.data) {
      setMonthlyItems((prev) => [...prev, res.data!])
      setMonthlyTotal((prev) => prev + res.data!.amount)
      setNewName('')
      setNewEmoji('📦')
      setNewAmount('')
      setShowAddForm(false)
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menambah')
    }
    setSavingMonthly(false)
  }

  const handleMonthlyAmountChange = (
    id: string,
    value: string
  ) => {
    setMonthlyEdits((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveMonthlyAmount = async (id: string) => {
    const val = monthlyEdits[id]
    if (val === undefined) return
    const amount = parseInt(val, 10)
    if (isNaN(amount) || amount < 0) {
      setError('Nominal harus angka >= 0')
      return
    }
    setSavingMonthly(true)

    const res = await apiClient<MonthlyExpense>(
      `/api/monthly-expenses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ amount }),
      }
    )

    if (res.success && res.data) {
      setMonthlyItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, amount } : item
        )
      )
      const newTotal = monthlyItems.reduce(
        (s, i) => s + (i.id === id ? amount : i.amount),
        0
      )
      setMonthlyTotal(newTotal)
      setMonthlyEdits((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } else if (!res.success) {
      setError(res.error ?? 'Gagal update')
    }
    setSavingMonthly(false)
  }

  const handleDeleteMonthly = async (id: string) => {
    setSavingMonthly(true)
    const res = await apiClient<{ deleted: string }>(
      `/api/monthly-expenses/${id}`,
      { method: 'DELETE' }
    )

    if (res.success) {
      const removed = monthlyItems.find((i) => i.id === id)
      setMonthlyItems((prev) =>
        prev.filter((i) => i.id !== id)
      )
      if (removed) {
        setMonthlyTotal((prev) => prev - removed.amount)
      }
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menghapus')
    }
    setSavingMonthly(false)
  }

  const getMonthlyAmount = (item: MonthlyExpense): string => {
    if (item.id in monthlyEdits) return monthlyEdits[item.id]!
    return String(item.amount)
  }

  const renderBudgetField = (field: BudgetField) => (
    <div
      key={field.key}
      className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{field.emoji}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {field.label}
          </p>
          <p className="text-xs text-gray-400">
            {field.hint}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={getBudgetValue(field.key)}
          onChange={(e) =>
            handleChange(field.key, e.target.value)
          }
          className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
        />
      </div>
    </div>
  )

  const targetDate = getTargetDate()
  const daysLeft = getDaysFromNow(targetDate)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gray-800 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">⚙️ Pengaturan</h1>
        <p className="text-sm text-gray-400">
          Atur budget, target & preferensi
        </p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-gray-400">Memuat pengaturan...</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {/* Target Lunas */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              🎯 Target Lunas Hutang
            </h2>
            <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tanggal Target
                    </p>
                    <p className="text-xs text-gray-400">
                      {daysLeft > 0
                        ? `${daysLeft} hari lagi`
                        : daysLeft === 0
                          ? 'Hari ini!'
                          : `${Math.abs(daysLeft)} hari lewat`}
                    </p>
                  </div>
                </div>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    handleChange(
                      'debt_target_date',
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
                />
              </div>
              <p className="text-xs text-center text-gray-400">
                {formatDateDisplay(targetDate)}
              </p>
            </div>
          </div>

          {/* Daily budgets */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              Budget Harian
            </h2>
            {DAILY_FIELDS.map(renderBudgetField)}
            <div className="flex justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">
                Total Harian
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {formatRupiah(dailyTotal)}
              </span>
            </div>
          </div>

          {/* Monthly expenses - DYNAMIC (F013) */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              📆 Biaya Bulanan
            </h2>

            {monthlyItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Per bulan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={getMonthlyAmount(item)}
                      onChange={(e) =>
                        handleMonthlyAmountChange(
                          item.id,
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        item.id in monthlyEdits &&
                        void handleSaveMonthlyAmount(item.id)
                      }
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void handleDeleteMonthly(item.id)
                    }
                    className="tap-highlight-none rounded-lg p-1.5 text-red-400 hover:bg-red-50 active:scale-95"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Add form */}
            {showAddForm ? (
              <div className="rounded-xl bg-white border-2 border-dashed border-emerald-300 p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">
                    Pilih Ikon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewEmoji(em)}
                        className={`tap-highlight-none rounded-lg p-2 text-lg transition-all active:scale-95 ${
                          newEmoji === em
                            ? 'bg-emerald-100 ring-2 ring-emerald-400'
                            : 'bg-gray-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Nama (cth: Listrik)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={30}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                />

                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Nominal per bulan"
                    value={newAmount}
                    onChange={(e) =>
                      setNewAmount(e.target.value)
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewName('')
                      setNewEmoji('📦')
                      setNewAmount('')
                    }}
                    className="tap-highlight-none flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-500 active:scale-95"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAddMonthly()}
                    disabled={
                      !newName.trim() ||
                      !newAmount ||
                      savingMonthly
                    }
                    className="tap-highlight-none flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {savingMonthly
                      ? '⏳ Menyimpan...'
                      : '✅ Tambah'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="tap-highlight-none w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-center text-sm text-gray-400 transition-all active:scale-95 hover:border-emerald-300 hover:text-emerald-500"
              >
                + Tambah Biaya Bulanan
              </button>
            )}

            {/* Monthly total */}
            <div className="flex justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <span className="text-sm font-medium text-blue-700">
                Total Bulanan
              </span>
              <span className="text-sm font-bold text-blue-700">
                {formatRupiah(monthlyTotal)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Save daily budgets + target */}
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
            {saving
              ? '⏳ Menyimpan...'
              : saved
                ? '✅ Tersimpan!'
                : '💾 Simpan Pengaturan'}
          </button>

          {/* App info */}
          <div className="text-center space-y-1 pt-4">
            <p className="text-xs text-gray-400">
              Money Manager v1.2.0
            </p>
            <p className="text-xs text-gray-300">
              Driver Ojol Financial Dashboard
            </p>
          </div>
        </div>
      )}

      <BottomNav active="settings" />
    </div>
  )
}
