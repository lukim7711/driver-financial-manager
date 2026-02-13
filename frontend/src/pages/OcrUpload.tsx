import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { apiClient } from '../lib/api'
import { compressImage } from '../lib/compress-image'
import { OcrResult } from '../components/OcrResult'
import { BottomNav } from '../components/BottomNav'

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

export function OcrUpload() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [ocrData, setOcrData] = useState<OcrData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setOcrData(null)

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Format tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    setProcessing(true)

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/ocr`,
        { method: 'POST', body: formData }
      )
      const json = await res.json() as { success: boolean; data?: OcrData; error?: string }

      if (json.success && json.data) {
        setOcrData(json.data)
      } else {
        setError(json.error || 'OCR gagal')
      }
    } catch {
      setError('Koneksi gagal. Coba lagi.')
    } finally {
      setProcessing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const handleSave = async (data: { type: string; category: string; amount: number; note: string }) => {
    const res = await apiClient('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...data, source: 'ocr' }),
    })
    if (res.success) {
      void navigate('/')
    } else {
      setError(res.error || 'Gagal menyimpan')
    }
  }

  const handleDiscard = () => {
    setOcrData(null)
    setPreview(null)
    setError(null)
  }

  const handleRetry = () => {
    setError(null)
    setOcrData(null)
    setPreview(null)
  }

  // Result screen
  if (ocrData) {
    return (
      <OcrResult
        ocrData={ocrData}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    )
  }

  // Upload / Processing screen
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-4 pt-6 pb-4 text-white">
        <h1 className="text-lg font-bold">📷 Upload Struk</h1>
        <p className="text-sm text-indigo-200">Foto struk, biar app yang baca</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        {preview && (
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview struk" className="w-full max-h-64 object-contain bg-white" />
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className="rounded-2xl bg-white border border-gray-200 p-8 text-center space-y-3">
            <p className="text-3xl animate-spin inline-block">🔄</p>
            <p className="font-semibold text-gray-700">Membaca struk...</p>
            <p className="text-xs text-gray-400">Biasanya kurang dari 5 detik</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={handleRetry}
                className="tap-highlight-none rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
              >
                🔄 Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => void navigate('/input')}
                className="tap-highlight-none rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
              >
                ✏️ Input Manual
              </button>
            </div>
          </div>
        )}

        {/* Upload area */}
        {!processing && !error && !preview && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center space-y-4">
            <p className="text-4xl">📸</p>
            <p className="text-sm text-gray-500">Tap untuk foto atau pilih dari galeri</p>
          </div>
        )}

        {/* Action buttons */}
        {!processing && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="tap-highlight-none rounded-2xl bg-indigo-500 py-4 text-center font-bold text-white transition-all active:scale-95"
            >
              📷 Kamera
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="tap-highlight-none rounded-2xl border border-indigo-200 bg-indigo-50 py-4 text-center font-bold text-indigo-600 transition-all active:scale-95"
            >
              🖼️ Galeri
            </button>
          </div>
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

        {!processing && (
          <button
            type="button"
            onClick={() => void navigate(-1)}
            className="w-full text-center text-sm text-gray-400 py-2"
          >
            ← Kembali
          </button>
        )}
      </div>

      <BottomNav active="input" />
    </div>
  )
}
