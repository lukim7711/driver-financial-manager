import { formatRupiah } from '../lib/format'

interface DeleteDebtDialogProps {
  platform: string
  totalRemaining: number
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

export function DeleteDebtDialog({
  platform,
  totalRemaining,
  onConfirm,
  onCancel,
  loading,
}: DeleteDebtDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 space-y-4">
        <div className="text-center">
          <p className="text-3xl">⚠️</p>
          <h2 className="mt-2 text-lg font-bold text-gray-800">
            Hapus Hutang?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold">{platform}</span>
          </p>
          {totalRemaining > 0 && (
            <p className="mt-1 text-xs text-red-500">
              Sisa hutang {formatRupiah(totalRemaining)} akan
              dihapus dari tracking
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Menghapus...' : '🗑️ Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
