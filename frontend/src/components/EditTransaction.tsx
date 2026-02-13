import { useState } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah, formatTime } from '../lib/format'

const INCOME_CATS = [
  { id: 'order', emoji: '🛵', label: 'Order' },
  { id: 'tips', emoji: '💝', label: 'Tips' },
  { id: 'bonus', emoji: '🎁', label: 'Bonus' },
  { id: 'insentif', emoji: '🏆', label: 'Insentif' },
  { id: 'lainnya', emoji: '📦', label: 'Lainnya' },
]

const EXPENSE_CATS = [
  { id: 'bbm', emoji: '⛽', label: 'BBM' },
  { id: 'makan', emoji: '🍜', label: 'Makan' },
  { id: 'rokok', emoji: '🚬', label: 'Rokok' },
  { id: 'pulsa', emoji: '📱', label: 'Pulsa' },
  { id: 'parkir', emoji: '🅿️', label: 'Parkir' },
  { id: 'service', emoji: '🔧', label: 'Service' },
  { id: 'rt', emoji: '🏠', label: 'RT' },
  { id: 'lainnya', emoji: '📦', label: 'Lainnya' },
]

interface Transaction {
  id: string
  created_at: string
  type: string
  amount: number
  category: string
  note: string
  source: string
  debt_id: string | null
}

interface EditTransactionProps {
  tx: Transaction
  onDone: () => void
  onCancel: () => void
}

export function EditTransaction({ tx, onDone, onCancel }: EditTransactionProps) {
  const isDebt = tx.type === 'debt_payment'
  const cats = tx.type === 'income' ? INCOME_CATS : EXPENSE_CATS

  const [category, setCategory] = useState(tx.category)
  const [amount, setAmount] = useState(String(tx.amount))
  const [note, setNote] = useState(tx.note)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeLabel = tx.type === 'income' ? '💰 Pemasukan' : tx.type === 'expense' ? '💸 Pengeluaran' : '💳 Bayar Hutang'

  const handleSave = async () => {
    const amt = parseInt(amount, 10)
    if (!amt || amt <= 0 || saving) return
    setSaving(true)
    setError(null)
    const res = await apiClient(`/api/transactions/${tx.id}`, {
      method: 'PUT',
      body: JSON.stringify({ amount: amt, category, note }),
    })
    if (res.success) {
      onDone()
    } else {
      setError(res.error || 'Gagal menyimpan')
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    const res = await apiClient(`/api/transactions/${tx.id}`, {
      method: 'DELETE',
    })
    if (res.success) {
      onDone()
    } else {
      setError(res.error || 'Gagal menghapus')
      setSaving(false)
    }
  }

  const amtNum = parseInt(amount, 10) || 0
  const canSave = amtNum > 0 && !saving

  // Read-only for debt payments
  if (isDebt) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
        <div className="w-full max-w-md rounded-t-2xl bg-white p-6 space-y-4">
          <h2 className="text-center text-lg font-bold text-gray-800">💳 Pembayaran Hutang</h2>
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tipe</span>
              <span className="font-medium">{typeLabel} 🔒</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nominal</span>
              <span className="font-bold text-orange-600">{formatRupiah(tx.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Waktu</span>
              <span>{formatTime(tx.created_at)}</span>
            </div>
            {tx.note && (
              <div className="flex justify-between">
                <span className="text-gray-500">Catatan</span>
                <span>{tx.note}</span>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">
            Pembayaran hutang tidak bisa diedit/dihapus.
            Kelola melalui halaman Hutang.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-sm text-gray-400 py-2"
          >
            ← Tutup
          </button>
        </div>
      </div>
    )
  }

  // Delete confirmation
  if (confirmDelete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-4">
          <h2 className="text-center text-lg font-bold text-gray-800">⚠️ Hapus Transaksi?</h2>
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">{formatRupiah(tx.amount)} — {tx.category}</p>
            {tx.note && <p className="text-gray-400">{tx.note}</p>}
          </div>
          <p className="text-center text-xs text-gray-400">
            Transaksi yang dihapus tidak bisa dikembalikan.
          </p>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setConfirmDelete(false); setError(null) }}
              className="tap-highlight-none rounded-xl border border-gray-200 bg-white py-3 text-center font-bold text-gray-600 transition-all active:scale-95"
            >
              ❌ Batal
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving}
              className="tap-highlight-none rounded-xl bg-red-500 py-3 text-center font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? '⏳' : '🗑️'} Hapus
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Edit form
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-center text-lg font-bold text-gray-800">✏️ Edit Transaksi</h2>

        <div className="flex justify-between text-sm text-gray-500">
          <span>{typeLabel} 🔒</span>
          <span>{formatTime(tx.created_at)} 🔒</span>
        </div>

        {/* Category picker */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Kategori:</p>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`tap-highlight-none rounded-xl border py-2 text-center text-xs transition-all ${
                  category === c.id
                    ? 'border-purple-400 bg-purple-50 font-bold text-purple-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <br />{c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Nominal:</p>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold text-gray-700 outline-none focus:border-purple-300"
          />
        </div>

        {/* Note */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Catatan:</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opsional"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-purple-300"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave}
          className="tap-highlight-none w-full rounded-xl bg-purple-500 py-4 text-center text-lg font-bold text-white transition-all active:scale-95 disabled:bg-gray-300"
        >
          {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="tap-highlight-none w-full rounded-xl border border-red-200 bg-red-50 py-3 text-center font-bold text-red-500 transition-all active:scale-95"
        >
          🗑️ Hapus Transaksi
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-sm text-gray-400 py-2"
        >
          ← Batal
        </button>
      </div>
    </div>
  )
}
