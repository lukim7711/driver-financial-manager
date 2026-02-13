import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah } from '../lib/format'
import { BottomNav } from '../components/BottomNav'
import type { MonthlyExpense, DailyExpense } from '../types'

interface SettingsData {
  debt_target_date: string
}

interface ListResponse<T> {
  items: T[]
  total: number
}

const DAILY_EMOJI_OPTIONS = [
  '⛽', '🍜', '🚭', '📱', '🅿️', '🔧', '🚗',
  '☕', '💊', '🧊', '🛒', '📦', '🎮', '🏋️',
]

const MONTHLY_EMOJI_OPTIONS = [
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
  const local = new Date(
    now.getTime() + offset * 60 * 1000
  )
  const today = local.toISOString().slice(0, 10)
  const diffMs =
    new Date(dateStr).getTime() -
    new Date(today).getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function Settings() {
  const [targetDate, setTargetDate] = useState('2026-04-13')
  const [editDate, setEditDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Daily expenses state
  const [dailyItems, setDailyItems] = useState<DailyExpense[]>([])
  const [dailyTotal, setDailyTotal] = useState(0)
  const [showAddDaily, setShowAddDaily] = useState(false)
  const [newDailyName, setNewDailyName] = useState('')
  const [newDailyEmoji, setNewDailyEmoji] = useState('📦')
  const [newDailyAmount, setNewDailyAmount] = useState('')
  const [dailyEdits, setDailyEdits] = useState<
    Record<string, string>
  >({})
  const [savingDaily, setSavingDaily] = useState(false)

  // Monthly expenses state
  const [monthlyItems, setMonthlyItems] = useState<
    MonthlyExpense[]
  >([])
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [showAddMonthly, setShowAddMonthly] = useState(false)
  const [newMonthlyName, setNewMonthlyName] = useState('')
  const [newMonthlyEmoji, setNewMonthlyEmoji] = useState('📦')
  const [newMonthlyAmount, setNewMonthlyAmount] = useState('')
  const [monthlyEdits, setMonthlyEdits] = useState<
    Record<string, string>
  >({})
  const [savingMonthly, setSavingMonthly] = useState(false)

  const [savingTarget, setSavingTarget] = useState(false)
  const [savedTarget, setSavedTarget] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [settingsRes, dailyRes, monthlyRes] =
      await Promise.all([
        apiClient<SettingsData>('/api/settings'),
        apiClient<ListResponse<DailyExpense>>(
          '/api/daily-expenses'
        ),
        apiClient<ListResponse<MonthlyExpense>>(
          '/api/monthly-expenses'
        ),
      ])
    if (settingsRes.success && settingsRes.data) {
      setTargetDate(
        settingsRes.data.debt_target_date || '2026-04-13'
      )
    }
    if (dailyRes.success && dailyRes.data) {
      setDailyItems(dailyRes.data.items)
      setDailyTotal(dailyRes.data.total)
    }
    if (monthlyRes.success && monthlyRes.data) {
      setMonthlyItems(monthlyRes.data.items)
      setMonthlyTotal(monthlyRes.data.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  // === Target date ===
  const handleSaveTarget = async () => {
    if (!editDate || savingTarget) return
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editDate)) {
      setError('Format tanggal tidak valid')
      return
    }
    setSavingTarget(true)
    setError(null)
    const res = await apiClient<SettingsData>(
      '/api/settings',
      {
        method: 'PUT',
        body: JSON.stringify({
          debt_target_date: editDate,
        }),
      }
    )
    if (res.success && res.data) {
      setTargetDate(
        res.data.debt_target_date || editDate
      )
      setEditDate(null)
      setSavedTarget(true)
      setTimeout(() => setSavedTarget(false), 2000)
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menyimpan')
    }
    setSavingTarget(false)
  }

  // === Daily CRUD ===
  const handleAddDaily = async () => {
    if (!newDailyName.trim() || savingDaily) return
    const amount = parseInt(newDailyAmount, 10)
    if (isNaN(amount) || amount < 0) {
      setError('Nominal harus angka >= 0')
      return
    }
    setSavingDaily(true)
    setError(null)
    const res = await apiClient<DailyExpense>(
      '/api/daily-expenses',
      {
        method: 'POST',
        body: JSON.stringify({
          name: newDailyName.trim(),
          emoji: newDailyEmoji,
          amount,
        }),
      }
    )
    if (res.success && res.data) {
      setDailyItems((prev) => [...prev, res.data!])
      setDailyTotal((prev) => prev + res.data!.amount)
      setNewDailyName('')
      setNewDailyEmoji('📦')
      setNewDailyAmount('')
      setShowAddDaily(false)
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menambah')
    }
    setSavingDaily(false)
  }

  const handleDailyAmountChange = (
    id: string,
    value: string
  ) => {
    setDailyEdits((prev) => ({ ...prev, [id]: value }))
  }

  const handleSaveDailyAmount = async (id: string) => {
    const val = dailyEdits[id]
    if (val === undefined) return
    const amount = parseInt(val, 10)
    if (isNaN(amount) || amount < 0) {
      setError('Nominal harus angka >= 0')
      return
    }
    setSavingDaily(true)
    const res = await apiClient<DailyExpense>(
      `/api/daily-expenses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ amount }),
      }
    )
    if (res.success) {
      setDailyItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, amount } : i
        )
      )
      const newTotal = dailyItems.reduce(
        (s, i) => s + (i.id === id ? amount : i.amount),
        0
      )
      setDailyTotal(newTotal)
      setDailyEdits((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } else if (!res.success) {
      setError(res.error ?? 'Gagal update')
    }
    setSavingDaily(false)
  }

  const handleDeleteDaily = async (id: string) => {
    setSavingDaily(true)
    const res = await apiClient<{ deleted: string }>(
      `/api/daily-expenses/${id}`,
      { method: 'DELETE' }
    )
    if (res.success) {
      const removed = dailyItems.find((i) => i.id === id)
      setDailyItems((prev) =>
        prev.filter((i) => i.id !== id)
      )
      if (removed) {
        setDailyTotal((prev) => prev - removed.amount)
      }
    } else if (!res.success) {
      setError(res.error ?? 'Gagal menghapus')
    }
    setSavingDaily(false)
  }

  const getDailyAmount = (item: DailyExpense): string => {
    if (item.id in dailyEdits) return dailyEdits[item.id]!
    return String(item.amount)
  }

  // === Monthly CRUD ===
  const handleAddMonthly = async () => {
    if (!newMonthlyName.trim() || savingMonthly) return
    const amount = parseInt(newMonthlyAmount, 10)
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
          name: newMonthlyName.trim(),
          emoji: newMonthlyEmoji,
          amount,
        }),
      }
    )
    if (res.success && res.data) {
      setMonthlyItems((prev) => [...prev, res.data!])
      setMonthlyTotal((prev) => prev + res.data!.amount)
      setNewMonthlyName('')
      setNewMonthlyEmoji('📦')
      setNewMonthlyAmount('')
      setShowAddMonthly(false)
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
    if (res.success) {
      setMonthlyItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, amount } : i
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
      const removed = monthlyItems.find(
        (i) => i.id === id
      )
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

  const getMonthlyAmount = (
    item: MonthlyExpense
  ): string => {
    if (item.id in monthlyEdits)
      return monthlyEdits[item.id]!
    return String(item.amount)
  }

  // === Render helpers ===
  const currentDate = editDate ?? targetDate
  const daysLeft = getDaysFromNow(currentDate)
  const hasDateChange = editDate !== null

  const renderExpenseItem = (
    item: { id: string; emoji: string; name: string },
    hint: string,
    getValue: () => string,
    onChange: (id: string, val: string) => void,
    onBlur: (id: string) => void,
    onDelete: (id: string) => void,
    editsMap: Record<string, string>
  ) => (
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
          <p className="text-xs text-gray-400">{hint}</p>
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
            value={getValue()}
            onChange={(e) =>
              onChange(item.id, e.target.value)
            }
            onBlur={() =>
              item.id in editsMap &&
              void onBlur(item.id)
            }
            className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
          />
        </div>
        <button
          type="button"
          onClick={() => void onDelete(item.id)}
          className="tap-highlight-none rounded-lg p-1.5 text-red-400 hover:bg-red-50 active:scale-95"
        >
          🗑️
        </button>
      </div>
    </div>
  )

  const renderAddForm = (
    show: boolean,
    setShow: (v: boolean) => void,
    emojiOptions: string[],
    emoji: string,
    setEmoji: (v: string) => void,
    name: string,
    setName: (v: string) => void,
    amount: string,
    setAmount: (v: string) => void,
    saving: boolean,
    onAdd: () => void,
    label: string
  ) => {
    if (show) {
      return (
        <div className="rounded-xl bg-white border-2 border-dashed border-emerald-300 p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">
              Pilih Ikon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`tap-highlight-none rounded-lg p-2 text-lg transition-all active:scale-95 ${
                    emoji === em
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
            placeholder="Nama (cth: Parkir)"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              placeholder="Nominal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShow(false)
                setName('')
                setEmoji('📦')
                setAmount('')
              }}
              className="tap-highlight-none flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-500 active:scale-95"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => void onAdd()}
              disabled={
                !name.trim() || !amount || saving
              }
              className="tap-highlight-none flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {saving
                ? '⏳ Menyimpan...'
                : '✅ Tambah'}
            </button>
          </div>
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="tap-highlight-none w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-center text-sm text-gray-400 transition-all active:scale-95 hover:border-emerald-300 hover:text-emerald-500"
      >
        + {label}
      </button>
    )
  }

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
          <p className="text-gray-400">
            Memuat pengaturan...
          </p>
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
                  value={currentDate}
                  onChange={(e) =>
                    setEditDate(e.target.value)
                  }
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-bold text-gray-700 outline-none focus:border-emerald-300"
                />
              </div>
              <p className="text-xs text-center text-gray-400">
                {formatDateDisplay(currentDate)}
              </p>
              {hasDateChange && (
                <button
                  type="button"
                  onClick={() => void handleSaveTarget()}
                  disabled={savingTarget}
                  className="tap-highlight-none w-full rounded-lg bg-gray-800 py-2 text-sm font-bold text-white active:scale-95 disabled:bg-gray-300"
                >
                  {savingTarget
                    ? '⏳ Menyimpan...'
                    : '💾 Simpan Target'}
                </button>
              )}
              {savedTarget && (
                <p className="text-xs text-center text-emerald-600">
                  ✅ Target tersimpan!
                </p>
              )}
            </div>
          </div>

          {/* Daily budgets — DYNAMIC CRUD */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              💸 Budget Harian
            </h2>

            {dailyItems.map((item) =>
              renderExpenseItem(
                item,
                'Per hari',
                () => getDailyAmount(item),
                handleDailyAmountChange,
                (id) => void handleSaveDailyAmount(id),
                (id) => void handleDeleteDaily(id),
                dailyEdits
              )
            )}

            {renderAddForm(
              showAddDaily,
              setShowAddDaily,
              DAILY_EMOJI_OPTIONS,
              newDailyEmoji,
              setNewDailyEmoji,
              newDailyName,
              setNewDailyName,
              newDailyAmount,
              setNewDailyAmount,
              savingDaily,
              handleAddDaily,
              'Tambah Budget Harian'
            )}

            <div className="flex justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">
                Total Harian
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {formatRupiah(dailyTotal)}
              </span>
            </div>
          </div>

          {/* Monthly expenses — DYNAMIC CRUD */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500">
              📆 Biaya Bulanan
            </h2>

            {monthlyItems.map((item) =>
              renderExpenseItem(
                item,
                'Per bulan',
                () => getMonthlyAmount(item),
                handleMonthlyAmountChange,
                (id) =>
                  void handleSaveMonthlyAmount(id),
                (id) => void handleDeleteMonthly(id),
                monthlyEdits
              )
            )}

            {renderAddForm(
              showAddMonthly,
              setShowAddMonthly,
              MONTHLY_EMOJI_OPTIONS,
              newMonthlyEmoji,
              setNewMonthlyEmoji,
              newMonthlyName,
              setNewMonthlyName,
              newMonthlyAmount,
              setNewMonthlyAmount,
              savingMonthly,
              handleAddMonthly,
              'Tambah Biaya Bulanan'
            )}

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

          {/* App info */}
          <div className="text-center space-y-1 pt-4">
            <p className="text-xs text-gray-400">
              Money Manager v1.3.1
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
