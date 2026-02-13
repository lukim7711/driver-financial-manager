import { useState } from 'react'
import { formatRupiah } from '../lib/format'

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

const INCOME_CATS = [
  { id: 'order', emoji: '🛵', label: 'Order' },
  { id: 'tips', emoji: '💝', label: 'Tips' },
  { id: 'bonus', emoji: '🎁', label: 'Bonus' },
  { id: 'insentif', emoji: '🏆', label: 'Insentif' },
  { id: 'lainnya', emoji: '📦', label: 'Lainnya' },
]

interface OcrSuggestion {
  type: 'expense' | 'income'
  category: string
  amount: number
  note: string
}

interface OcrData {
  raw_text: string
  suggestion: OcrSuggestion | null
  message?: string
}

interface OcrResultProps {
  ocrData: OcrData
  onSave: (data: { type: string; category: string; amount: number; note: string }) => Promise<void>
  onDiscard: () => void
}

export function OcrResult({ ocrData, onSave, onDiscard }: OcrResultProps) {
  const s = ocrData.suggestion
  const [type, setType] = useState<'expense' | 'income'>(s?.type ?? 'expense')
  const [category, setCategory] = useState(s?.category ?? 'lainnya')
  const [amount, setAmount] = useState(String(s?.amount ?? ''))
  const [note, setNote] = useState(s?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(!s)

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS
  const amtNum = parseInt(amount, 10) || 0
  const canSave = amtNum > 0 && !saving

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    await onSave({ type, category, amount: amtNum, note })
    setSaving(false)
  }

  // No suggestion — show raw text + manual mode
  if (!s && !editing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-center space-y-2">
          <p className="text-2xl">⚠️</p>
          <p className="text-sm text-yellow-700">{ocrData.message || 'Struk tidak terbaca dengan baik'}</p>
        </div>
        {ocrData.raw_text && (
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-gray-500 mb-1">Teks terdeteksi:</p>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{ocrData.raw_text}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="tap-highlight-none w-full rounded-xl bg-indigo-500 py-3 text-center font-bold text-white"
        >
          ✏️ Input Manual dari Teks
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="w-full text-center text-sm text-gray-400 py-2"
        >
          🗑️ Buang
        </button>
      </div>
    )
  }

  // Confirm / Edit mode
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <h1 className="text-center text-lg font-bold text-gray-800">
        {editing ? '✏️ Edit Hasil OCR' : '✅ Hasil OCR'}
      </h1>

      {/* Raw text preview */}
      {ocrData.raw_text && (
        <div className="rounded-xl bg-gray-100 p-3">
          <p className="text-xs text-gray-500 mb-1">Teks terdeteksi:</p>
          <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-4">
            {ocrData.raw_text}
          </p>
        </div>
      )}

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { if (editing) { setType('expense'); setCategory('lainnya') } }}
          className={`tap-highlight-none rounded-xl py-3 text-center text-sm font-bold transition-all ${
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'border border-gray-200 text-gray-500'
          } ${!editing ? 'opacity-60' : ''}`}
        >
          💸 Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => { if (editing) { setType('income'); setCategory('order') } }}
          className={`tap-highlight-none rounded-xl py-3 text-center text-sm font-bold transition-all ${
            type === 'income'
              ? 'bg-emerald-500 text-white'
              : 'border border-gray-200 text-gray-500'
          } ${!editing ? 'opacity-60' : ''}`}
        >
          💰 Pemasukan
        </button>
      </div>

      {/* Category */}
      {editing ? (
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
                    ? 'border-indigo-400 bg-indigo-50 font-bold text-indigo-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <br />{c.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Kategori</span>
          <span className="font-semibold">
            {cats.find((c) => c.id === category)?.emoji} {cats.find((c) => c.id === category)?.label}
          </span>
        </div>
      )}

      {/* Amount */}
      {editing ? (
        <div>
          <p className="text-sm text-gray-500 mb-1">Nominal:</p>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-bold text-gray-700 outline-none focus:border-indigo-300"
          />
        </div>
      ) : (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Nominal</span>
          <span className="text-xl font-bold text-gray-800">{formatRupiah(amtNum)}</span>
        </div>
      )}

      {/* Note */}
      {editing ? (
        <div>
          <p className="text-sm text-gray-500 mb-1">Catatan:</p>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opsional"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-indigo-300"
          />
        </div>
      ) : (
        note && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Catatan</span>
            <span className="text-gray-700">{note}</span>
          </div>
        )
      )}

      {/* Actions */}
      {editing ? (
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave}
          className="tap-highlight-none w-full rounded-xl bg-emerald-500 py-4 text-center text-lg font-bold text-white transition-all active:scale-95 disabled:bg-gray-300"
        >
          {saving ? '⏳ Menyimpan...' : '✅ Simpan Transaksi'}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="tap-highlight-none rounded-xl bg-emerald-500 py-4 text-center font-bold text-white transition-all active:scale-95 disabled:bg-gray-300"
          >
            {saving ? '⏳' : '✅'} Simpan
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="tap-highlight-none rounded-xl border border-indigo-200 bg-indigo-50 py-4 text-center font-bold text-indigo-600 transition-all active:scale-95"
          >
            ✏️ Edit
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onDiscard}
        className="w-full text-center text-sm text-gray-400 py-2"
      >
        🗑️ Buang
      </button>
    </div>
  )
}
