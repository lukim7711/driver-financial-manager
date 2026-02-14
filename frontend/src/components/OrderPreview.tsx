import { formatRupiah } from '../lib/format'

interface DetectedOrder {
  order_time: string
  platform: string
  platform_label: string
  fare_amount: number
  order_type: 'single' | 'combined'
}

interface OrderPreviewProps {
  date: string
  orders: DetectedOrder[]
  onDateChange: (date: string) => void
  onRemoveOrder: (index: number) => void
  onEditFare: (index: number, amount: number) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}

const PLATFORM_STYLE: Record<string, {
  emoji: string; bg: string; text: string
}> = {
  spx_instant: {
    emoji: '\ud83d\udce6',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  spx_sameday: {
    emoji: '\ud83d\udce6',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  spx_standard: {
    emoji: '\ud83d\udce6',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
  },
  shopeefood: {
    emoji: '\ud83c\udf54',
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
}

function formatDateLabel(d: string): string {
  const dt = new Date(d)
  return dt.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function OrderPreview({
  date,
  orders,
  onDateChange,
  onRemoveOrder,
  onEditFare,
  onSave,
  onCancel,
  saving,
}: OrderPreviewProps) {
  const total = orders.reduce(
    (s, o) => s + o.fare_amount, 0
  )
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4">
      {/* Date header */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200">
        <label className="text-xs text-gray-400 block mb-1">
          {'\ud83d\udcc5'} Tanggal Order
        </label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 focus:border-purple-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          {formatDateLabel(date)}
        </p>
      </div>

      {/* Order list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500">
          {'\ud83d\udef5'} {orders.length} Order Terdeteksi
        </h2>
        {orders.map((order, idx) => {
          const style = PLATFORM_STYLE[order.platform]
            ?? PLATFORM_STYLE['spx_instant']!
          return (
            <div
              key={`${order.order_time}-${idx}`}
              className="rounded-xl bg-white p-3 shadow-sm border border-gray-200 flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    {order.order_time}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                    {style.emoji} {order.platform_label}
                  </span>
                  {order.order_type === 'combined' && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600">
                      Gabungan
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    Argo:
                  </span>
                  <input
                    type="number"
                    value={order.fare_amount}
                    onChange={(e) =>
                      onEditFare(
                        idx,
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="w-24 rounded border border-gray-200 px-2 py-0.5 text-sm font-semibold text-emerald-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveOrder(idx)}
                className="tap-highlight-none rounded-lg p-2 text-red-400 hover:bg-red-50 active:scale-90"
              >
                {'\u2716'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Total bar */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">
            {'\ud83d\udcb0'} Total Pemasukan
          </span>
          <span className="text-xl font-bold text-emerald-600">
            {formatRupiah(total)}
          </span>
        </div>
        <p className="text-xs text-emerald-500 mt-1">
          {orders.length} order akan disimpan sebagai 1
          transaksi pemasukan
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="tap-highlight-none rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 active:scale-95"
        >
          {'\u2190'} Batal
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || orders.length === 0}
          className="tap-highlight-none rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white active:scale-95 disabled:opacity-50"
        >
          {saving
            ? '\u23f3 Menyimpan...'
            : '\u2705 Simpan Semua'}
        </button>
      </div>
    </div>
  )
}
