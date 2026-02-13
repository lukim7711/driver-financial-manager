import { useState, useMemo } from 'react'
import { formatRupiah } from '../lib/format'

type DebtType = 'installment' | 'simple'

interface AddDebtFormProps {
  onSubmit: (data: {
    platform: string
    total_original: number
    monthly_installment: number
    due_day: number
    total_installments: number
    late_fee_type: string
    late_fee_rate: number
    debt_type: DebtType
    due_date?: string
    note?: string
  }) => Promise<void>
  onCancel: () => void
  loading: boolean
}

interface PreviewItem {
  label: string
  amount: number
  isLast: boolean
}

function buildPreview(
  total: number,
  monthly: number,
  count: number,
  dueDay: number
): PreviewItem[] {
  if (total <= 0 || monthly <= 0 || count <= 0) return []
  const items: PreviewItem[] = []
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60000)
  let year = local.getFullYear()
  let month = local.getMonth()
  let remaining = total

  for (let i = 0; i < count; i++) {
    const day = Math.min(
      dueDay,
      new Date(year, month + 1, 0).getDate()
    )
    const dt = new Date(year, month, day)
    const label = dt.toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric',
    })
    const isLast = i === count - 1
    const amt = isLast
      ? remaining
      : Math.min(monthly, remaining)
    remaining -= amt

    items.push({ label, amount: amt, isLast })
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }
  return items
}

export function AddDebtForm({
  onSubmit,
  onCancel,
  loading,
}: AddDebtFormProps) {
  const [mode, setMode] = useState<DebtType>(
    'installment'
  )
  const [platform, setPlatform] = useState('')
  const [totalOriginal, setTotalOriginal] = useState('')
  const [installment, setInstallment] = useState('')
  const [dueDay, setDueDay] = useState('15')
  const [totalInst, setTotalInst] = useState('6')
  const [feeType, setFeeType] = useState('pct_monthly')
  const [feeRate, setFeeRate] = useState('0')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const preview = useMemo(() => {
    if (mode !== 'installment') return []
    return buildPreview(
      parseInt(totalOriginal, 10) || 0,
      parseInt(installment, 10) || 0,
      parseInt(totalInst, 10) || 0,
      parseInt(dueDay, 10) || 15
    )
  }, [mode, totalOriginal, installment, totalInst, dueDay])

  const previewSum = preview.reduce(
    (s, p) => s + p.amount,
    0
  )

  const handleSubmit = async () => {
    setError('')
    if (!platform.trim()) {
      setError('Nama wajib diisi')
      return
    }
    const total = parseInt(totalOriginal, 10)
    if (!total || total <= 0) {
      setError('Total hutang harus > 0')
      return
    }

    if (mode === 'simple') {
      if (!dueDate) {
        setError('Tanggal bayar wajib diisi')
        return
      }
      await onSubmit({
        platform: platform.trim(),
        total_original: total,
        monthly_installment: total,
        due_day: parseInt(dueDate.slice(8, 10), 10) || 1,
        total_installments: 1,
        late_fee_type: 'pct_monthly',
        late_fee_rate: 0,
        debt_type: 'simple',
        due_date: dueDate,
        note: note.trim(),
      })
      return
    }

    const inst = parseInt(installment, 10)
    if (!inst || inst <= 0) {
      setError('Cicilan bulanan harus > 0')
      return
    }
    const day = parseInt(dueDay, 10)
    if (!day || day < 1 || day > 31) {
      setError('Tanggal jatuh tempo 1-31')
      return
    }
    const numInst = parseInt(totalInst, 10)
    if (!numInst || numInst < 1) {
      setError('Jumlah cicilan minimal 1')
      return
    }
    const rate = parseFloat(feeRate) || 0

    await onSubmit({
      platform: platform.trim(),
      total_original: total,
      monthly_installment: inst,
      due_day: day,
      total_installments: numInst,
      late_fee_type: feeType,
      late_fee_rate: rate / 100,
      debt_type: 'installment',
      note: note.trim(),
    })
  }

  const inputCls =
    'mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none'
  const labelCls = 'text-xs font-medium text-gray-500'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            ➕ Tambah Hutang Baru
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode('installment')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              mode === 'installment'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            🏦 Cicilan
          </button>
          <button
            type="button"
            onClick={() => setMode('simple')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              mode === 'simple'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            🤝 Pinjaman
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className={labelCls}>
              {mode === 'simple'
                ? 'Pinjam ke Siapa'
                : 'Platform / Nama'}
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder={
                mode === 'simple'
                  ? 'cth: Andri, Budi'
                  : 'cth: Akulaku, Kredivo'
              }
              className={inputCls}
              maxLength={50}
            />
          </div>

          <div>
            <label className={labelCls}>
              {mode === 'simple'
                ? 'Jumlah Pinjaman (Rp)'
                : 'Total Hutang (Rp)'}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={totalOriginal}
              onChange={(e) =>
                setTotalOriginal(e.target.value)
              }
              placeholder="500000"
              className={inputCls}
            />
          </div>

          {mode === 'simple' ? (
            <>
              <div>
                <label className={labelCls}>
                  Tanggal Bayar
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  placeholder="cth: Pinjam buat beli ban"
                  className={inputCls}
                  maxLength={100}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>
                  Cicilan/Bulan (Rp)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={installment}
                  onChange={(e) =>
                    setInstallment(e.target.value)
                  }
                  placeholder="162845"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Tgl Jatuh Tempo
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={dueDay}
                    onChange={(e) =>
                      setDueDay(e.target.value)
                    }
                    min={1}
                    max={31}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Jumlah Cicilan
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={totalInst}
                    onChange={(e) =>
                      setTotalInst(e.target.value)
                    }
                    min={1}
                    max={120}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>
                    Tipe Denda
                  </label>
                  <select
                    value={feeType}
                    onChange={(e) =>
                      setFeeType(e.target.value)
                    }
                    className={`${inputCls} bg-white`}
                  >
                    <option value="pct_monthly">
                      % / Bulan
                    </option>
                    <option value="pct_daily">
                      % / Hari
                    </option>
                  </select>
                </div>
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
                    placeholder="5"
                    step="0.01"
                    min={0}
                    className={inputCls}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview Jadwal */}
        {mode === 'installment' && preview.length > 0 && (
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              📋 Preview Jadwal
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {preview.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600">
                    {p.label}
                  </span>
                  <span
                    className={`font-medium ${
                      p.isLast
                        ? 'text-amber-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {formatRupiah(p.amount)}
                    {p.isLast && ' ⚡'}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Total: {formatRupiah(previewSum)}
              {previewSum ===
              (parseInt(totalOriginal, 10) || 0)
                ? ' ✅ Cocok'
                : ' ⚠️ Tidak cocok'}
            </p>
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
            : mode === 'simple'
              ? '💾 Simpan Pinjaman'
              : '💾 Simpan Hutang'}
        </button>
      </div>
    </div>
  )
}
