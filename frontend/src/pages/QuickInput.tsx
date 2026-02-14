import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { CategoryGrid, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../components/CategoryGrid'
import { AmountInput } from '../components/AmountInput'
import { apiClient } from '../lib/api'
import { useToast } from '../components/Toast'

type TxType = 'income' | 'expense'
type Step = 1 | 2 | 3

export function QuickInput() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<Step>(1)
  const [txType, setTxType] = useState<TxType | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const getCategoryLabel = useCallback(() => {
    if (!category || !txType) return ''
    const cats = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    const found = cats.find((c) => c.id === category)
    return found ? `${found.emoji} ${found.label}` : category
  }, [category, txType])

  const handleTypeSelect = (type: TxType) => {
    setTxType(type)
    setStep(2)
  }

  const handleCategorySelect = (catId: string) => {
    setCategory(catId)
    setStep(3)
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setAmount(null)
      setNote('')
    } else if (step === 2) {
      setStep(1)
      setCategory(null)
    } else {
      void navigate('/')
    }
  }

  const handleSave = async () => {
    if (!txType || !category || !amount || saving) return
    setSaving(true)

    const res = await apiClient<unknown>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        type: txType,
        amount,
        category,
        note: note || '',
        source: 'manual',
      }),
    })

    if (res.success) {
      toast.success('Transaksi tersimpan')
      void navigate('/')
    } else {
      toast.error(res.error)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="tap-highlight-none text-sm text-gray-500"
        >
          {'\u2190'} Kembali
        </button>
        <StepIndicator current={step} />
      </div>

      {/* Step 1: Pilih Tipe */}
      {step === 1 && (
        <div className="space-y-4">
          <h1 className="text-center text-lg font-bold text-gray-800">
            {'\u270f\ufe0f'} Catat Transaksi
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTypeSelect('income')}
              className="tap-highlight-none rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-6 text-center transition-all active:scale-95"
            >
              <span className="text-3xl">{'\ud83d\udcb0'}</span>
              <p className="mt-2 font-bold text-emerald-700">MASUK</p>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('expense')}
              className="tap-highlight-none rounded-2xl bg-red-50 border-2 border-red-200 p-6 text-center transition-all active:scale-95"
            >
              <span className="text-3xl">{'\ud83d\udcb8'}</span>
              <p className="mt-2 font-bold text-red-700">KELUAR</p>
            </button>
          </div>

          {/* OCR shortcut */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => void navigate('/ocr')}
              className="tap-highlight-none w-full rounded-2xl bg-purple-50 border-2 border-purple-200 p-4 text-center transition-all active:scale-95"
            >
              <span className="text-2xl">{'\ud83d\udcf7'}</span>
              <p className="mt-1 text-sm font-bold text-purple-700">Foto Struk (OCR)</p>
              <p className="text-xs text-purple-400">Upload struk, otomatis tercatat</p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Pilih Kategori */}
      {step === 2 && txType && (
        <div className="space-y-4">
          <h1 className="text-center text-lg font-bold text-gray-800">
            {txType === 'income' ? '\ud83d\udcb0 Pemasukan' : '\ud83d\udcb8 Pengeluaran'} {'\u2014'} Kategori
          </h1>
          <CategoryGrid type={txType} onSelect={handleCategorySelect} />
        </div>
      )}

      {/* Step 3: Pilih Nominal */}
      {step === 3 && category && (
        <div className="space-y-4">
          <h1 className="text-center text-lg font-bold text-gray-800">
            {getCategoryLabel()} {'\u2014'} Berapa?
          </h1>

          <AmountInput
            category={category}
            amount={amount}
            onAmountChange={setAmount}
          />

          {/* Note input */}
          <input
            type="text"
            placeholder={'\ud83d\udcdd Catatan (opsional)'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-300"
          />

          {/* Save button */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!amount || saving}
            className={`tap-highlight-none w-full rounded-xl py-4 text-center text-lg font-bold transition-all active:scale-95 ${
              !amount || saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-500 text-white shadow-lg active:bg-emerald-600'
            }`}
          >
            {saving ? '\u23f3 Menyimpan...' : '\u2705 SIMPAN'}
          </button>
        </div>
      )}
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === current ? 'w-6 bg-emerald-500' : s < current ? 'w-2 bg-emerald-300' : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
