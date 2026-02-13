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
    note?: string
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

function nextMonth(offset: number): string {
  const now = new Date()
  const wib = new Date(
    now.getTime() + 7 * 60 * 60 * 1000
  )
  let y = wib.getFullYear()
  let m = wib.getMonth() + offset
  while (m > 11) {
    m -= 12
    y++
  }
  while (m < 0) {
    m += 12
    y--
  }
  const mm = String(m + 1).padStart(2, '0')
  return `${y}-${mm}-15`
}

let keyCounter = 0
function nextKey(): number {
  return ++keyCounter
}

export function AddDebtForm({
  onSubmit,
  onCancel,
  loading,
}: AddDebtFormProps) {
  const [platform, setPlatform] = useState('')
  const [totalStr, setTotalStr] = useState('')
  const [note, setNote] = useState('')
  const [feeRate, setFeeRate] = useState('0')
  const [error, setError] = useState('')

  // Shortcut fields
  const [scMonthly, setScMonthly] = useState('')
  const [scDay, setScDay] = useState('1')
  const [scCount, setScCount] = useState('5')

  // Schedule rows
  const [rows, setRows] = useState<ScheduleRow[]>(
    []
  )

  const total = parseInt(totalStr, 10) || 0
  const schedSum = rows.reduce(
    (s, r) => s + (parseInt(r.amount, 10) || 0),
    0
  )
  const isMatch = schedSum === total && total > 0

  const handleAutoFill = () => {
    const monthly = parseInt(scMonthly, 10) || 0
    const day = parseInt(scDay, 10) || 1
    const count = parseInt(scCount, 10) || 1
    if (monthly <= 0 || total <= 0 || count <= 0)
      return

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
  }

  const handleAddRow = () => {
    const lastDate =
      rows.length > 0
        ? rows[rows.length - 1]!.due_date
        : nextMonth(1)
    // Next month from last row
    const d = new Date(lastDate)
    d.setMonth(d.getMonth() + 1)
    const y = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(
      2,
      '0'
    )
    const dd = lastDate.slice(8, 10)
    const newDate = `${y}-${mm}-${dd}`

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
        'Tambahkan minimal 1 jadwal cicilan'
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

    const rate = parseFloat(feeRate) || 0

    await onSubmit({
      platform: platform.trim(),
      total_original: total,
      note: note.trim() || undefined,
      late_fee_rate: rate / 100,
      late_fee_type: 'pct_monthly',
      schedules,
    })
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none'
  const labelCls =
    'text-xs font-medium text-gray-500'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 space-y-4 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            \u2795 Tambah Hutang Baru
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 text-xl"
          >
            \u2715
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Name + Total */}
        <div className="space-y-3">
          <div>
            <label className={labelCls}>
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
            <label className={labelCls}>
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

        {/* Shortcut */}
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500">
            \u26a1 Shortcut Isi Cepat
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">
                Cicilan/Bln
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={scMonthly}
                onChange={(e) =>
                  setScMonthly(e.target.value)
                }
                placeholder="162845"
                className={`mt-0.5 ${inputCls} text-xs py-2`}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">
                Tgl
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={scDay}
                onChange={(e) =>
                  setScDay(e.target.value)
                }
                min={1}
                max={31}
                className={`mt-0.5 ${inputCls} text-xs py-2`}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">
                Brp Kali
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={scCount}
                onChange={(e) =>
                  setScCount(e.target.value)
                }
                min={1}
                max={120}
                className={`mt-0.5 ${inputCls} text-xs py-2`}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="w-full rounded-lg bg-amber-100 py-2 text-xs font-bold text-amber-700 transition-all active:scale-95"
          >
            \u26a1 Isi Rata (auto-fill)
          </button>
        </div>

        {/* Schedule Rows */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">
            \ud83d\udcc5 Jadwal Cicilan
            {rows.length > 0 && (
              <span className="ml-1 font-normal text-gray-400">
                ({rows.length} jadwal)
              </span>
            )}
          </p>

          {rows.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400">
                Belum ada jadwal.
              </p>
              <p className="text-xs text-gray-400">
                Gunakan \u26a1 Isi Rata atau \u2795
                Tambah manual.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rows.map((r, idx) => {
                const amt =
                  parseInt(r.amount, 10) || 0
                const isLast =
                  idx === rows.length - 1 &&
                  rows.length > 1 &&
                  amt !==
                    (parseInt(
                      rows[0]!.amount,
                      10
                    ) || 0)

                return (
                  <div
                    key={r.key}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 p-2"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5">
                      {idx + 1}
                    </span>
                    <input
                      type="date"
                      value={r.due_date}
                      onChange={(e) =>
                        handleRowChange(
                          r.key,
                          'due_date',
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-blue-400 focus:outline-none"
                    />
                    <div className="relative">
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
                        className={`w-24 rounded-lg border px-2 py-1.5 text-xs text-right focus:outline-none ${
                          isLast
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-gray-200'
                        }`}
                      />
                      {isLast && (
                        <span className="absolute -top-1.5 -right-1 text-[10px]">
                          \u26a1
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteRow(r.key)
                      }
                      className="text-red-400 text-sm active:scale-90"
                    >
                      \ud83d\uddd1\ufe0f
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add row */}
          <button
            type="button"
            onClick={handleAddRow}
            className="mt-2 w-full rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-xs font-semibold text-gray-400 transition-all active:scale-95"
          >
            \u2795 Tambah Jadwal
          </button>
        </div>

        {/* Total checker */}
        {rows.length > 0 && (
          <div
            className={`rounded-xl px-3 py-2 text-xs font-medium ${
              isMatch
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            Total jadwal:{' '}
            {formatRupiah(schedSum)} /{' '}
            {formatRupiah(total)}{' '}
            {isMatch ? '\u2705 Cocok' : '\u26a0\ufe0f Belum cocok'}
          </div>
        )}

        {/* Extra fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Denda (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={feeRate}
              onChange={(e) =>
                setFeeRate(e.target.value)
              }
              placeholder="0"
              step="0.01"
              min={0}
              className={`mt-1 ${inputCls}`}
            />
          </div>
          <div>
            <label className={labelCls}>
              Catatan
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              placeholder="opsional"
              className={`mt-1 ${inputCls}`}
              maxLength={100}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {loading
            ? 'Menyimpan...'
            : '\ud83d\udcbe Simpan Hutang'}
        </button>
      </div>
    </div>
  )
}
