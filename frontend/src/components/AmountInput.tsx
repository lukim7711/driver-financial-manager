import { useState } from 'react'
import { PresetButton } from './PresetButton'
import { formatRupiah } from '../lib/format'

const PRESETS: Record<string, number[]> = {
  bbm: [20000, 30000, 40000, 50000, 60000, 80000],
  makan: [10000, 15000, 20000, 25000, 30000, 40000],
  rokok: [13500, 18000, 22000, 27000, 35000],
  pulsa: [5000, 10000, 15000, 20000, 25000, 50000],
  parkir: [2000, 3000, 5000, 10000],
  rt: [20000, 30000, 50000, 60000, 85000, 100000],
  service: [20000, 50000, 100000, 150000, 200000],
  lainnya_keluar: [10000, 20000, 50000, 100000],
  order: [10000, 15000, 20000, 25000, 30000, 50000],
  bonus: [20000, 50000, 100000, 150000, 200000],
  lainnya_masuk: [10000, 20000, 50000, 100000],
}

function formatPresetLabel(value: number): string {
  if (value >= 1000) {
    const k = value / 1000
    return Number.isInteger(k) ? `${k}k` : `${k}k`
  }
  return String(value)
}

interface AmountInputProps {
  category: string
  amount: number | null
  onAmountChange: (amount: number | null) => void
}

export function AmountInput({ category, amount, onAmountChange }: AmountInputProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const presets = PRESETS[category] || PRESETS['lainnya_keluar']!

  const handlePresetClick = (value: number) => {
    setShowCustom(false)
    setCustomValue('')
    onAmountChange(value)
  }

  const handleCustomToggle = () => {
    setShowCustom(true)
    onAmountChange(null)
    setCustomValue('')
  }

  const handleNumpadPress = (digit: string) => {
    if (digit === 'clear') {
      setCustomValue('')
      onAmountChange(null)
      return
    }
    if (digit === 'backspace') {
      const next = customValue.slice(0, -1)
      setCustomValue(next)
      onAmountChange(next ? parseInt(next, 10) : null)
      return
    }
    const next = customValue + digit
    const num = parseInt(next, 10)
    if (num <= 10_000_000) {
      setCustomValue(next)
      onAmountChange(num)
    }
  }

  return (
    <div className="space-y-4">
      {/* Display amount */}
      <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">Nominal</p>
        <p className="text-3xl font-bold text-gray-800">
          {amount ? formatRupiah(amount) : 'Rp 0'}
        </p>
      </div>

      {/* Preset buttons */}
      {!showCustom && (
        <div className="grid grid-cols-3 gap-2">
          {presets.map((value) => (
            <PresetButton
              key={value}
              value={value}
              label={formatPresetLabel(value)}
              selected={amount === value}
              onClick={handlePresetClick}
            />
          ))}
        </div>
      )}

      {/* Custom numpad toggle */}
      {!showCustom && (
        <button
          type="button"
          onClick={handleCustomToggle}
          className="tap-highlight-none w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-center text-sm text-gray-500 transition-all active:bg-gray-50"
        >
          ⌨️ Ketik Nominal Lain
        </button>
      )}

      {/* Custom numpad */}
      {showCustom && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'backspace'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleNumpadPress(key)}
                className="tap-highlight-none rounded-xl bg-white py-4 text-center text-lg font-semibold text-gray-700 shadow-sm border border-gray-200 transition-all active:scale-95 active:bg-gray-100"
              >
                {key === 'backspace' ? '⌫' : key}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowCustom(false)
              setCustomValue('')
              onAmountChange(null)
            }}
            className="w-full text-center text-sm text-gray-500 py-2"
          >
            Kembali ke preset
          </button>
        </div>
      )}
    </div>
  )
}
