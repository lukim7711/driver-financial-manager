import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'

const route = new Hono<{ Bindings: Bindings }>()

interface OcrSpaceResult {
  ParsedResults?: {
    ParsedText?: string
    ErrorMessage?: string
  }[]
  IsErroredOnProcessing?: boolean
  ErrorMessage?: string[]
}

interface Suggestion {
  type: 'expense' | 'income'
  category: string
  amount: number
  note: string
}

const CATEGORY_KEYWORDS: { keywords: string[]; category: string }[] = [
  { keywords: ['pertalite', 'pertamax', 'bensin', 'solar', 'spbu', 'pertamina', 'shell', 'bbm'], category: 'bbm' },
  { keywords: ['nasi', 'makan', 'minum', 'warung', 'resto', 'kopi', 'teh', 'ayam', 'bakso', 'mie', 'sate', 'warteg', 'rice', 'food'], category: 'makan' },
  { keywords: ['rokok', 'sampoerna', 'surya', 'djarum', 'gudang', 'marlboro', 'magnum'], category: 'rokok' },
  { keywords: ['pulsa', 'data', 'telkomsel', 'indosat', 'xl', 'smartfren', 'tri', 'internet'], category: 'pulsa' },
  { keywords: ['parkir', 'parking'], category: 'parkir' },
  { keywords: ['oli', 'ban', 'bengkel', 'service', 'servis', 'tambal'], category: 'service' },
]

function detectCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const rule of CATEGORY_KEYWORDS) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category
    }
  }
  return 'lainnya'
}

function extractAmount(text: string): number {
  const patterns = [
    /(?:total|jumlah|bayar|grand\s*total)[:\s]*(?:rp\.?\s*)?([\d.,]+)/gi,
    /rp\.?\s*([\d.,]+)/gi,
    /([\d.,]{4,})/g,
  ]

  let maxAmount = 0

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1]!.replace(/\./g, '').replace(/,/g, '')
      const num = parseInt(raw, 10)
      if (num > maxAmount && num >= 500 && num <= 50000000) {
        maxAmount = num
      }
    }
  }

  return maxAmount
}

function buildNote(text: string, category: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const firstLine = lines[0] ?? ''
  const short = firstLine.slice(0, 50)
  return short || category
}

function parseSuggestion(rawText: string): Suggestion {
  const category = detectCategory(rawText)
  const amount = extractAmount(rawText)
  const note = buildNote(rawText, category)

  return {
    type: 'expense',
    category,
    amount,
    note,
  }
}

function isBlobLike(value: unknown): value is Blob {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in (value as Record<string, unknown>) &&
    'size' in (value as Record<string, unknown>)
  )
}

// POST /api/ocr
route.post('/', async (c) => {
  try {
    const apiKey = c.env.OCR_SPACE_API_KEY
    if (!apiKey) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'OCR API key belum dikonfigurasi' },
        500
      )
    }

    const contentType = c.req.header('content-type') || ''
    let ocrFormData: FormData

    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('file')
      if (!file || !isBlobLike(file)) {
        return c.json<ApiResponse<never>>(
          { success: false, error: 'File gambar wajib diupload' },
          400
        )
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return c.json<ApiResponse<never>>(
          { success: false, error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' },
          400
        )
      }

      ocrFormData = new FormData()
      ocrFormData.append('file', file)
      ocrFormData.append('apikey', apiKey)
      ocrFormData.append('language', 'eng')
      ocrFormData.append('isOverlayRequired', 'false')
      ocrFormData.append('OCREngine', '2')
    } else {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Content-Type harus multipart/form-data' },
        400
      )
    }

    const ocrRes = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: ocrFormData,
    })

    if (!ocrRes.ok) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `OCR service error: ${ocrRes.status}` },
        502
      )
    }

    const ocrData = await ocrRes.json() as OcrSpaceResult

    if (ocrData.IsErroredOnProcessing || ocrData.ErrorMessage?.length) {
      const errMsg = ocrData.ErrorMessage?.join(', ') || 'OCR processing failed'
      return c.json<ApiResponse<never>>(
        { success: false, error: errMsg },
        502
      )
    }

    const parsed = ocrData.ParsedResults?.[0]
    const rawText = parsed?.ParsedText?.trim() || ''

    if (!rawText) {
      return c.json<ApiResponse<unknown>>({
        success: true,
        data: {
          raw_text: '',
          suggestion: null,
          message: 'Struk tidak terbaca. Silakan input manual.',
        },
      })
    }

    const suggestion = parseSuggestion(rawText)

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        raw_text: rawText,
        suggestion,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as ocrRoute }
