import { useState } from 'react'
import { formatRupiah } from '../lib/format'

interface ScheduleRow {
  key: number
  due_date: string
  amount: string
}

interface AddDebtFormProps {
  onSubmit: (data: {
    platform: string
    total_original: number
    late_fee_rate: number
    late_fee_type: string
    schedules: Array<{
      due_date: string
      amount: number
    }>
  }) => Promise<void>
  onCancel: () => void
  loading: boolean
}

let keySeq = 0
function nextKey(): number {
  return ++keySeq
}

export function AddDebtForm({
  onSubmit,
  onCancel,
  loading,
}: AddDebtFormProps) {
  const [platform, setPlatform] = useState('')
  const [totalStr, setTotalStr] = useState('')
  const [monthlyStr, setMonthlyStr] = useState('')
  const [dayStr, setDayStr] = useState('1')
  const [rows, setRows] = useState<ScheduleRow[]>(
    []
  )
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  const total = parseInt(totalStr, 10) || 0
  const monthly = parseInt(monthlyStr, 10) || 0
  const day = parseInt(dayStr, 10) || 1

  const autoCount =
    total > 0 && monthly > 0
      ? Math.ceil(total / monthly)
      : 0

  const schedSum = rows.reduce(
    (s, r) => s + (parseInt(r.amount, 10) || 0),
    0
  )
  const isMatch = schedSum === total && total > 0

  const handleGenerate = () => {
    if (total <= 0 || monthly <= 0) return
    const count = Math.ceil(total / monthly)
    const now = new Date()
    const wib = new Date(
      now.getTime() + 7 * 60 * 60 * 1000
    )
    let year = wib.getFullYear()
    let month = wib.getMonth()
    let remaining = total
    const newRows: ScheduleRow[] = []

    for (let i = 0; i < count; i++) {
      const maxDay = new Date(
        year,
        month + 1,
        0
      ).getDate()
      const d = Math.min(day, maxDay)
      const dd = String(d).padStart(2, '0')
      const mm = String(month + 1).padStart(
        2,
        '0'
      )
      const dueDate = `${year}-${mm}-${dd}`
      const isLast = i === count - 1
      const amt = isLast
        ? remaining
        : Math.min(monthly, remaining)
      remaining -= amt

      newRows.push({
        key: nextKey(),
        due_date: dueDate,
        amount: String(amt),
      })
      month++
      if (month > 11) {
        month = 0
        year++
      }
    }
    setRows(newRows)
    setGenerated(true)
    setError('')
  }

  const handleAddRow = () => {
    const lastDate =
      rows.length > 0
        ? rows[rows.length - 1]!.due_date
        : ''
    let newDate: string
    if (lastDate) {
      const d = new Date(lastDate)
      d.setMonth(d.getMonth() + 1)
      const y = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(
        2,
        '0'
      )
      const dd = lastDate.slice(8, 10)
      newDate = `${y}-${mm}-${dd}`
    } else {
      const now = new Date()
      const wib = new Date(
        now.getTime() + 7 * 60 * 60 * 1000
      )
      const y = wib.getFullYear()
      const mm = String(
        wib.getMonth() + 1
      ).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      newDate = `${y}-${mm}-${dd}`
    }
    const remainAmt = Math.max(total - schedSum, 0)
    setRows([
      ...rows,
      {
        key: nextKey(),
        due_date: newDate,
        amount: String(remainAmt),
      },
    ])
  }

  const handleDeleteRow = (key: number) => {
    setRows(rows.filter((r) => r.key !== key))
  }

  const handleRowChange = (
    key: number,
    field: 'due_date' | 'amount',
    value: string
  ) => {
    setRows(
      rows.map((r) =>
        r.key === key
          ? { ...r, [field]: value }
          : r
      )
    )
  }

  const handleSubmit = async () => {
    setError('')
    if (!platform.trim()) {
      setError('Nama wajib diisi')
      return
    }
    if (total <= 0) {
      setError('Total hutang harus > 0')
      return
    }
    if (rows.length === 0) {
      setError(
        'Tap \u26a1 Hitung Jadwal atau + Tambah Baris'
      )
      return
    }
    if (!isMatch) {
      setError(
        `Total jadwal (${formatRupiah(schedSum)}) \u2260 total hutang (${formatRupiah(total)})`
      )
      return
    }
    const schedules = rows.map((r) => ({
      due_date: r.due_date,
      amount: parseInt(r.amount, 10) || 0,
    }))
    await onSubmit({
      platform: platform.trim(),
      total_original: total,
      late_fee_rate: 0,
      late_fee_type: 'pct_monthly',
      schedules,
    })
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none'

  const formatShort = (d: string): string => {
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 space-y-4 animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Tambah Hutang
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 text-xl leading-none"
          >
            {"\u00d7"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Nama / Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) =>
                setPlatform(e.target.value)
              }
              placeholder="cth: SPayLater, Andri"
              className={`mt-1 ${inputCls}`}
              maxLength={50}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Total Hutang (Rp)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={totalStr}
              onChange={(e) =>
                setTotalStr(e.target.value)
              }
              placeholder="672000"
              className={`mt-1 ${inputCls}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-500">
              Cicilan/Bulan (Rp)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={monthlyStr}
              onChange={(e) => {
                setMonthlyStr(e.target.value)
                setGenerated(false)
              }}
              placeholder="162845"
              className={`mt-1 ${inputCls}`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              Tgl Bayar
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={dayStr}
              onChange={(e) => {
                setDayStr(e.target.value)
                setGenerated(false)
              }}
              min={1}
              max={31}
              className={`mt-1 ${inputCls}`}
            />
          </div>
        </div>

        {autoCount > 0 && !generated && (
          <p className="text-xs text-gray-400 -mt-2">
            {'= '}{autoCount}{'x cicilan'}
          </p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={total <= 0 || monthly <= 0}
          className="w-full rounded-xl bg-amber-50 border border-amber-200 py-2.5 text-sm font-semibold text-amber-700 transition-all active:scale-95 disabled:opacity-40"
        >
          {"\u26a1"} Hitung Jadwal
        </button>

        {rows.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Jadwal Cicilan
              <span className="ml-1 font-normal text-gray-400">
                {rows.length}x
              </span>
            </p>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {rows.map((r, idx) => {
                const amt =
                  parseInt(r.amount, 10) || 0
                const firstAmt =
                  parseInt(
                    rows[0]?.amount ?? '0',
                    10
                  ) || 0
                const isLast =
                  idx === rows.length - 1 &&
                  rows.length > 1 &&
                  amt !== firstAmt

                return (
                  <div
                    key={r.key}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs text-gray-400 w-14 shrink-0">
                      {formatShort(r.due_date)}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={r.amount}
                      onChange={(e) =>
                        handleRowChange(
                          r.key,
                          'amount',
                          e.target.value
                        )
                      }
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs text-right focus:outline-none ${
                        isLast
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-gray-200'
                      }`}
                    />
                    {isLast && (
                      <span className="text-xs">{"\u26a1"}</span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteRow(r.key)
                      }
                      className="text-red-300 text-sm active:scale-90 hover:text-red-500"
                    >
                      {"\u2715"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddRow}
          className="w-full rounded-xl border-2 border-dashed border-gray-200 py-2 text-xs font-medium text-gray-400 transition-all active:scale-95"
        >
          + Tambah Baris
        </button>

        {rows.length > 0 && (
          <div
            className={`rounded-xl px-3 py-2 text-xs font-medium ${
              isMatch
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {isMatch
              ? `\u2705 ${formatRupiah(schedSum)} \u2014 cocok`
              : `\u26a0\ufe0f ${formatRupiah(schedSum)} / ${formatRupiah(total)}`}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {loading
            ? 'Menyimpan...'
            : 'Simpan Hutang'}
        </button>
      </div>
    </div>
  )
}
