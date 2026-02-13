import { useState } from 'react'
import { formatRupiah } from '../lib/format'

interface EditDebtData {
  id: string
  platform: string
  total_original: number
  monthly_installment: number
  due_day: number
  total_installments: number
  late_fee_type: string
  late_fee_rate: number
}

interface EditDebtDialogProps {
  debt: EditDebtData
  onSubmit: (data: {
    platform?: string
    total_original?: number
    monthly_installment?: number
    due_day?: number
    late_fee_type?: string
    late_fee_rate?: number
  }) => Promise<void>
  onCancel: () => void
  loading: boolean
}

export function EditDebtDialog({
  debt,
  onSubmit,
  onCancel,
  loading,
}: EditDebtDialogProps) {
  const [platform, setPlatform] = useState(debt.platform)
  const [totalOrig, setTotalOrig] = useState(
    String(debt.total_original)
  )
  const [installment, setInstallment] = useState(
    String(debt.monthly_installment)
  )
  const [dueDay, setDueDay] = useState(String(debt.due_day))
  const [feeType, setFeeType] = useState(debt.late_fee_type)
  const [feeRate, setFeeRate] = useState(
    String((debt.late_fee_rate * 100).toFixed(2))
  )
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    const updates: Record<string, unknown> = {}

    if (platform.trim() !== debt.platform) {
      if (!platform.trim()) {
        setError('Platform wajib diisi')
        return
      }
      updates.platform = platform.trim()
    }

    const newTotal = parseInt(totalOrig, 10)
    if (newTotal !== debt.total_original) {
      if (!newTotal || newTotal <= 0) {
        setError('Total hutang harus > 0')
        return
      }
      updates.total_original = newTotal
    }

    const newInst = parseInt(installment, 10)
    if (newInst !== debt.monthly_installment) {
      if (!newInst || newInst <= 0) {
        setError('Cicilan harus > 0')
        return
      }
      updates.monthly_installment = newInst
    }

    const newDay = parseInt(dueDay, 10)
    if (newDay !== debt.due_day) {
      if (!newDay || newDay < 1 || newDay > 31) {
        setError('Tanggal jatuh tempo 1-31')
        return
      }
      updates.due_day = newDay
    }

    if (feeType !== debt.late_fee_type) {
      updates.late_fee_type = feeType
    }

    const newRate = parseFloat(feeRate) || 0
    const oldRatePct = debt.late_fee_rate * 100
    if (Math.abs(newRate - oldRatePct) > 0.001) {
      updates.late_fee_rate = newRate / 100
    }

    if (Object.keys(updates).length === 0) {
      onCancel()
      return
    }

    await onSubmit(updates as {
      platform?: string
      total_original?: number
      monthly_installment?: number
      due_day?: number
      late_fee_type?: string
      late_fee_rate?: number
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            ✏️ Edit Hutang
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Sisa: {formatRupiah(debt.total_original)}
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
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
                value={totalOrig}
                onChange={(e) => setTotalOrig(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">
                Cicilan/Bln (Rp)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500">
                  Denda
                </label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2.5 text-xs focus:border-blue-400 focus:outline-none bg-white"
                >
                  <option value="pct_monthly">/bln</option>
                  <option value="pct_daily">/hari</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">
                  %
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={feeRate}
                  onChange={(e) => setFeeRate(e.target.value)}
                  step="0.01"
                  min={0}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={loading}
          className="w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : '✅ Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
