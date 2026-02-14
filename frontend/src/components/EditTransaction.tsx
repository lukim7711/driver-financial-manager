import { useState } from 'react'
import { apiClient } from '../lib/api'
import { formatRupiah, formatTime } from '../lib/format'

const INCOME_CATS = [
  { id: 'order', emoji: '\ud83d\udef5', label: 'Order' },
  { id: 'tips', emoji: '\ud83d\udc9d', label: 'Tips' },
  { id: 'bonus', emoji: '\ud83c\udf81', label: 'Bonus' },
  { id: 'insentif', emoji: '\ud83c\udfc6', label: 'Insentif' },
  { id: 'lainnya', emoji: '\ud83d\udce6', label: 'Lainnya' },
]

const EXPENSE_CATS = [
  { id: 'bbm', emoji: '\u26fd', label: 'BBM' },
  { id: 'makan', emoji: '\ud83c\udf5c', label: 'Makan' },
  { id: 'rokok', emoji: '\ud83d\udead', label: 'Rokok' },
  { id: 'pulsa', emoji: '\ud83d\udcf1', label: 'Pulsa' },
  { id: 'parkir', emoji: '\ud83c\udd7f\ufe0f', label: 'Parkir' },
  { id: 'service', emoji: '\ud83d\udd27', label: 'Service' },
  { id: 'rt', emoji: '\ud83c\udfe0', label: 'RT' },
  { id: 'lainnya', emoji: '\ud83d\udce6', label: 'Lainnya' },
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

export function EditTransaction({
  tx,
  onDone,
  onCancel,
}: EditTransactionProps) {
  const isDebt = tx.type === 'debt_payment'
  const cats =
    tx.type === 'income'
      ? INCOME_CATS
      : EXPENSE_CATS

  const [category, setCategory] = useState(
    tx.category
  )
  const [amount, setAmount] = useState(
    String(tx.amount)
  )
  const [note, setNote] = useState(tx.note)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] =
    useState(false)
  const [error, setError] = useState<string | null>(
    null
  )

  const typeLabel =
    tx.type === 'income'
      ? '\ud83d\udcb0 Pemasukan'
      : tx.type === 'expense'
        ? '\ud83d\udcb8 Pengeluaran'
        : '\ud83d\udcb3 Bayar Hutang'

  const handleSave = async () => {
    const amt = parseInt(amount, 10)
    if (!amt || amt <= 0 || saving) return
    setSaving(true)
    setError(null)
    const res = await apiClient(
      `/api/transactions/${tx.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          amount: amt,
          category,
          note,
        }),
      }
    )
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
    const res = await apiClient(
      `/api/transactions/${tx.id}`,
      { method: 'DELETE' }
    )
    if (res.success) {
      onDone()
    } else {
      setError(res.error || 'Gagal menghapus')
      setSaving(false)
    }
  }

  const amtNum = parseInt(amount, 10) || 0
  const canSave = amtNum > 0 && !saving

  // === DEBT PAYMENT: detail + delete ===
  if (isDebt) {
    // Delete confirmation for debt payment
    if (confirmDelete) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-4">
            <h2 className="text-center text-lg font-bold text-gray-800">
              {'\u26a0\ufe0f'} Hapus Pembayaran Hutang?
            </h2>
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-2">
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {formatRupiah(tx.amount)}
                </p>
                {tx.note && (
                  <p className="text-sm text-gray-500">
                    {tx.note}
                  </p>
                )}
              </div>
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
                <p className="text-xs text-yellow-700">
                  {'\u26a0\ufe0f'} Sisa hutang akan
                  dikembalikan +{formatRupiah(tx.amount)}
                </p>
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false)
                  setError(null)
                }}
                className="tap-highlight-none rounded-xl border border-gray-200 bg-white py-3 text-center font-bold text-gray-600 transition-all active:scale-95"
              >
                {'\u274c'} Batal
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving}
                className="tap-highlight-none rounded-xl bg-red-500 py-3 text-center font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {saving
                  ? '\u23f3'
                  : '\ud83d\uddd1\ufe0f'}{' '}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Debt payment detail view
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
        <div className="w-full max-w-md rounded-t-2xl bg-white p-6 space-y-4">
          <h2 className="text-center text-lg font-bold text-gray-800">
            {'\ud83d\udcb3'} Pembayaran Hutang
          </h2>
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">
                Tipe
              </span>
              <span className="font-medium">
                {typeLabel}{' '}{'\ud83d\udd12'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Nominal
              </span>
              <span className="font-bold text-orange-600">
                {formatRupiah(tx.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Waktu
              </span>
              <span>
                {formatTime(tx.created_at)}
              </span>
            </div>
            {tx.note && (
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Catatan
                </span>
                <span>{tx.note}</span>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            Nominal & tipe tidak bisa diedit.
            Hapus akan mengembalikan sisa hutang.
          </p>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="tap-highlight-none w-full rounded-xl border border-red-200 bg-red-50 py-3 text-center font-bold text-red-500 transition-all active:scale-95"
          >
            {'\ud83d\uddd1\ufe0f'} Hapus Pembayaran
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-sm text-gray-400 py-2"
          >
            {'\u2190'} Tutup
          </button>
        </div>
      </div>
    )
  }

  // === DELETE CONFIRMATION (non-debt) ===
  if (confirmDelete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-4">
          <h2 className="text-center text-lg font-bold text-gray-800">
            {'\u26a0\ufe0f'} Hapus Transaksi?
          </h2>
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold">
              {formatRupiah(tx.amount)} \u2014{' '}
              {tx.category}
            </p>
            {tx.note && (
              <p className="text-gray-400">
                {tx.note}
              </p>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">
            Transaksi yang dihapus tidak bisa
            dikembalikan.
          </p>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-center text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false)
                setError(null)
              }}
              className="tap-highlight-none rounded-xl border border-gray-200 bg-white py-3 text-center font-bold text-gray-600 transition-all active:scale-95"
            >
              {'\u274c'} Batal
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving}
              className="tap-highlight-none rounded-xl bg-red-500 py-3 text-center font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {saving
                ? '\u23f3'
                : '\ud83d\uddd1\ufe0f'}{' '}
              Hapus
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === EDIT FORM (income/expense) ===
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <h2 className="text-center text-lg font-bold text-gray-800">
          {'\u270f\ufe0f'} Edit Transaksi
        </h2>

        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {typeLabel} {'\ud83d\udd12'}
          </span>
          <span>
            {formatTime(tx.created_at)}{' '}
            {'\ud83d\udd12'}
          </span>
        </div>

        {/* Category picker */}
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Kategori:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((ct) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => setCategory(ct.id)}
                className={`tap-highlight-none rounded-xl border py-2 text-center text-xs transition-all ${
                  category === ct.id
                    ? 'border-purple-400 bg-purple-50 font-bold text-purple-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-lg">
                  {ct.emoji}
                </span>
                <br />
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm text-gray-500 mb-1">
            Nominal:
          </p>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold text-gray-700 outline-none focus:border-purple-300"
          />
        </div>

        {/* Note */}
        <div>
          <p className="text-sm text-gray-500 mb-1">
            Catatan:
          </p>
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
          {saving
            ? '\u23f3 Menyimpan...'
            : '\ud83d\udcbe Simpan Perubahan'}
        </button>

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="tap-highlight-none w-full rounded-xl border border-red-200 bg-red-50 py-3 text-center font-bold text-red-500 transition-all active:scale-95"
        >
          {'\ud83d\uddd1\ufe0f'} Hapus Transaksi
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-sm text-gray-400 py-2"
        >
          {'\u2190'} Batal
        </button>
      </div>
    </div>
  )
}
