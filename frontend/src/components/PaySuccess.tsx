import { useNavigate } from 'react-router'
import { formatRupiah } from '../lib/format'

interface PayResult {
  platform: string
  paid_amount: number
  remaining: number
  is_fully_paid: boolean
}

interface PaySuccessProps {
  result: PayResult
  onDone: () => void
}

export function PaySuccess({ result, onDone }: PaySuccessProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="text-5xl">{result.is_fully_paid ? '🎉' : '✅'}</div>

        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {result.platform} bulan ini
          </h1>
          <p className="text-2xl font-bold text-emerald-600">LUNAS!</p>
        </div>

        <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Dibayar</span>
            <span className="font-bold text-gray-800">{formatRupiah(result.paid_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sisa hutang</span>
            <span className="font-bold text-gray-800">{formatRupiah(result.remaining)}</span>
          </div>
          {result.is_fully_paid && (
            <p className="mt-2 text-sm font-bold text-emerald-600">
              🎉 Hutang ini LUNAS SEMUA!
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onDone}
            className="tap-highlight-none w-full rounded-xl bg-blue-500 py-3 text-center font-bold text-white transition-all active:scale-95"
          >
            💳 Kembali ke Hutang
          </button>
          <button
            type="button"
            onClick={() => void navigate('/')}
            className="tap-highlight-none w-full rounded-xl border border-gray-200 bg-white py-3 text-center font-bold text-gray-600 transition-all active:scale-95"
          >
            🏠 Kembali ke Home
          </button>
        </div>
      </div>
    </div>
  )
}
