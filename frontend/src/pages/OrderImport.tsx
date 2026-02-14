import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { apiClient } from '../lib/api'
import { compressImage } from '../lib/compress-image'
import { formatRupiah } from '../lib/format'
import { useToast } from '../components/Toast'
import { OrderPreview } from '../components/OrderPreview'
import { BottomNav } from '../components/BottomNav'

interface DetectedOrder {
  order_time: string
  platform: string
  platform_label: string
  fare_amount: number
  order_type: 'single' | 'combined'
}

interface OcrOrdersResponse {
  raw_text: string
  detected_date: string | null
  orders: DetectedOrder[]
  total_fare: number
  order_count: number
  message?: string
}

interface BatchResponse {
  orders_saved: number
  orders_skipped: number
  total_income: number
  transaction_id: string | null
}

export function OrderImport() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [processing, setProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const [date, setDate] = useState('')
  const [orders, setOrders] = useState<DetectedOrder[]>([])
  const [hasResult, setHasResult] = useState(false)

  const handleFile = async (file: File) => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp',
    ]
    if (!validTypes.includes(file.type)) {
      toast.error('Format: JPG, PNG, atau WebP')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviews((prev) => [...prev, url])
    setProcessing(true)

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/ocr/orders`,
        { method: 'POST', body: formData }
      )
      const json = await res.json() as {
        success: boolean
        data?: OcrOrdersResponse
        error?: string
      }

      if (json.success && json.data) {
        const d = json.data
        if (d.orders.length === 0) {
          toast.error(
            d.message || 'Tidak ada order terdeteksi'
          )
          setProcessing(false)
          return
        }

        if (!date && d.detected_date) {
          setDate(d.detected_date)
        }

        setOrders((prev) => {
          const existing = new Set(
            prev.map((o) =>
              `${o.order_time}-${o.fare_amount}`
            )
          )
          const newOnes = d.orders.filter((o) =>
            !existing.has(
              `${o.order_time}-${o.fare_amount}`
            )
          )
          return [...prev, ...newOnes]
        })

        setHasResult(true)
        toast.success(
          `${d.orders.length} order terdeteksi`
        )
      } else {
        toast.error(json.error || 'OCR gagal')
      }
    } catch {
      toast.error('Koneksi gagal. Coba lagi.')
    } finally {
      setProcessing(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const handleRemoveOrder = (idx: number) => {
    setOrders((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleEditFare = (
    idx: number, amount: number
  ) => {
    setOrders((prev) =>
      prev.map((o, i) =>
        i === idx ? { ...o, fare_amount: amount } : o
      )
    )
  }

  const handleSave = async () => {
    if (!date) {
      toast.error('Tanggal wajib diisi')
      return
    }
    if (orders.length === 0) {
      toast.error('Tidak ada order untuk disimpan')
      return
    }

    setSaving(true)
    const res = await apiClient<BatchResponse>(
      '/api/orders/batch',
      {
        method: 'POST',
        body: JSON.stringify({ date, orders }),
      }
    )

    if (res.success) {
      const d = res.data
      const msg = d.orders_skipped > 0
        ? `${d.orders_saved} order disimpan (${d.orders_skipped} duplikat diskip). Total: ${formatRupiah(d.total_income)}`
        : `${d.orders_saved} order disimpan! Total: ${formatRupiah(d.total_income)}`
      toast.success(msg)
      void navigate('/')
    } else {
      toast.error(res.error)
    }
    setSaving(false)
  }

  const handleReset = () => {
    setOrders([])
    setDate('')
    setPreviews([])
    setHasResult(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-orange-500 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">
          {'\ud83d\udef5'} Rekap Order Shopee
        </h1>
        <p className="text-sm text-orange-100">
          Upload screenshot Riwayat Pesanan
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview images */}
        {previews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {previews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Screenshot ${i + 1}`}
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center space-y-3">
            <p className="text-3xl animate-spin inline-block">
              {'\ud83d\udd04'}
            </p>
            <p className="font-semibold text-gray-700">
              Membaca orderan...
            </p>
            <p className="text-xs text-gray-400">
              Mengekstrak waktu, platform, argo
            </p>
          </div>
        )}

        {/* Result: OrderPreview */}
        {hasResult && !processing && (
          <>
            <OrderPreview
              date={date}
              orders={orders}
              onDateChange={setDate}
              onRemoveOrder={handleRemoveOrder}
              onEditFare={handleEditFare}
              onSave={() => void handleSave()}
              onCancel={handleReset}
              saving={saving}
            />

            {/* Add more screenshots */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="tap-highlight-none w-full rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 py-3 text-sm font-medium text-orange-600 active:scale-95"
            >
              {'\u2795'} Tambah Screenshot
            </button>
          </>
        )}

        {/* Upload area */}
        {!hasResult && !processing && (
          <>
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center space-y-4">
              <p className="text-4xl">{'\ud83d\udcf8'}</p>
              <p className="text-sm text-gray-500">
                Screenshot halaman Riwayat Pesanan
                dari aplikasi Shopee
              </p>
              <p className="text-xs text-gray-400">
                App akan otomatis baca semua order
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="tap-highlight-none rounded-2xl bg-orange-500 py-4 text-center font-bold text-white transition-all active:scale-95"
              >
                {'\ud83d\udcf7'} Kamera
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="tap-highlight-none rounded-2xl border border-orange-200 bg-orange-50 py-4 text-center font-bold text-orange-600 transition-all active:scale-95"
              >
                {'\ud83d\uddbc\ufe0f'} Galeri
              </button>
            </div>

            <button
              type="button"
              onClick={() => void navigate(-1)}
              className="w-full text-center text-sm text-gray-400 py-2"
            >
              {'\u2190'} Kembali
            </button>
          </>
        )}

        {/* Hidden inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      <BottomNav active="input" />
    </div>
  )
}
