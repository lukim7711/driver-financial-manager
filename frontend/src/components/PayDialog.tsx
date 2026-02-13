import { useState } from 'react'
import { formatRupiah } from '../lib/format'

interface Schedule {
  id: string
  due_date: string
  amount: number
  status: string
  paid_amount: number | null
}

interface Debt {
  id: string
  platform: string
}

interface PayDialogProps {
  debt: Debt
  schedule: Schedule
  onConfirm: (amount: number, isFull: boolean) => Promise<unknown>
  onCancel: () => void
}

export function PayDialog({ debt, schedule, onConfirm, onCancel }: PayDialogProps) {
  const [mode, setMode] = useState<'choose' | 'partial'>('choose')
  const [customAmount, setCustomAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prevPaid = schedule.paid_amount || 0
  const remaining = schedule.amount - prevPaid

  const handleFullPay = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await onConfirm(remaining, true) as { success: boolean; error?: string } | undefined
      if (res && !res.success) {
        setError(res.error || 'Gagal membayar')
        setSaving(false)
      }
    } catch {
      setError('Koneksi gagal')
      setSaving(false)
    }
  }

  const handlePartialPay = async () => {
    const amt = parseInt(customAmount, 10)
    if (!amt || amt <= 0 || amt > remaining || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await onConfirm(amt, false) as { success: boolean; error?: string } | undefined
      if (res && !res.success) {
        setError(res.error || 'Gagal membayar')
        setSaving(false)
      }
    } catch {
      setError('Koneksi gagal')
      setSaving(false)
    }
  }

  const partialNum = parseInt(customAmount, 10) || 0
  const partialValid = partialNum > 0 && partialNum <= remaining

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 animate-slide-up">
        {mode === 'choose' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-bold text-gray-800">💳 Bayar Cicilan</h2>
            <div className="text-center">
              <p className="font-semibold text-gray-700">{debt.platform}</p>
              <p className="text-sm text-gray-500">Cicilan: {formatRupiah(schedule.amount)}</p>
              {prevPaid > 0 && (
                <p className="text-xs text-orange-500">Sudah dibayar: {formatRupiah(prevPaid)} • Sisa: {formatRupiah(remaining)}</p>
              )}
              <p className="text-xs text-gray-400">
                Jatuh tempo: {new Date(schedule.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void handleFullPay()}
                disabled={saving}
                className="tap-highlight-none rounded-xl bg-emerald-500 py-4 text-center font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? '⏳' : '✅'} Ya, {formatRupiah(remaining)}
              </button>
              <button
                type="button"
                onClick={() => setMode('partial')}
                disabled={saving}
                className="tap-highlight-none rounded-xl bg-orange-500 py-4 text-center font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                💰 Bayar Sebagian
              </button>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-center text-sm text-gray-400 py-2"
            >
              ← Batal
            </button>
          </div>
        )}

        {mode === 'partial' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-bold text-gray-800">💰 Bayar Sebagian</h2>
            <div className="text-center">
              <p className="font-semibold text-gray-700">{debt.platform}</p>
              <p className="text-sm text-gray-500">Cicilan: {formatRupiah(remaining)}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Nominal bayar:</label>
              <input
                type="number"
                inputMode="numeric"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                max={remaining}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-bold text-gray-700 outline-none focus:border-blue-300"
              />
              {partialNum > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Sisa cicilan: {formatRupiah(remaining - partialNum)}
                </p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handlePartialPay()}
              disabled={!partialValid || saving}
              className="tap-highlight-none w-full rounded-xl bg-emerald-500 py-4 text-center text-lg font-bold text-white transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {saving ? '⏳ Menyimpan...' : '✅ SIMPAN'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('choose'); setCustomAmount(''); setError(null) }}
              className="w-full text-center text-sm text-gray-400 py-2"
            >
              ← Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
