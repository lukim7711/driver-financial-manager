import { useState } from 'react'

interface AddDebtFormProps {
  onSubmit: (data: {
    platform: string
    total_original: number
    monthly_installment: number
    due_day: number
    total_installments: number
    late_fee_type: string
    late_fee_rate: number
  }) => Promise<void>
  onCancel: () => void
  loading: boolean
}

export function AddDebtForm({
  onSubmit,
  onCancel,
  loading,
}: AddDebtFormProps) {
  const [platform, setPlatform] = useState('')
  const [totalOriginal, setTotalOriginal] = useState('')
  const [installment, setInstallment] = useState('')
  const [dueDay, setDueDay] = useState('15')
  const [totalInst, setTotalInst] = useState('6')
  const [feeType, setFeeType] = useState('pct_monthly')
  const [feeRate, setFeeRate] = useState('0')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!platform.trim()) {
      setError('Nama platform wajib diisi')
      return
    }
    const total = parseInt(totalOriginal, 10)
    if (!total || total <= 0) {
      setError('Total hutang harus > 0')
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
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 space-y-4 animate-slide-up">
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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Platform / Nama
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="cth: Akulaku, Kredivo"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Total Hutang (Rp)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={totalOriginal}
                onChange={(e) => setTotalOriginal(e.target.value)}
                placeholder="1000000"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Cicilan/Bulan (Rp)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
                placeholder="200000"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Tgl Jatuh Tempo
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                min={1}
                max={31}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Jumlah Cicilan
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={totalInst}
                onChange={(e) => setTotalInst(e.target.value)}
                min={1}
                max={120}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Tipe Denda
              </label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none bg-white"
              >
                <option value="pct_monthly">% / Bulan</option>
                <option value="pct_daily">% / Hari</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Denda (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
                placeholder="5"
                step="0.01"
                min={0}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : '💾 Simpan Hutang'}
        </button>
      </div>
    </div>
  )
}
