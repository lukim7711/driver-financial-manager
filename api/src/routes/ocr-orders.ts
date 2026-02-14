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

interface DetectedOrder {
  order_time: string
  platform: string
  platform_label: string
  fare_amount: number
  order_type: 'single' | 'combined'
  raw_line: string
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  mei: '05', may: '05', jun: '06', jul: '07',
  agu: '08', aug: '08', sep: '09', okt: '10',
  oct: '10', nov: '11', des: '12', dec: '12',
}

function parseDate(text: string): string | null {
  const re =
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)\s+(\d{4})/i
  const m = re.exec(text)
  if (!m) return null
  const day = String(m[1]).padStart(2, '0')
  const monthKey = (m[2] ?? '').toLowerCase().slice(0, 3)
  const month = MONTH_MAP[monthKey]
  if (!month) return null
  const year = m[3]
  return `${year}-${month}-${day}`
}

function detectPlatform(
  text: string
): { platform: string; label: string } | null {
  const lower = text.toLowerCase()
  if (
    lower.includes('shopeefood') ||
    lower.includes('shopee food') ||
    lower.includes('shopee\nfood')
  ) {
    return { platform: 'shopeefood', label: 'ShopeeFood' }
  }
  if (lower.includes('spx instant')) {
    return { platform: 'spx_instant', label: 'SPX Instant' }
  }
  if (lower.includes('spx sameday')) {
    return { platform: 'spx_sameday', label: 'SPX Sameday' }
  }
  if (lower.includes('spx standard')) {
    return { platform: 'spx_standard', label: 'SPX Standard' }
  }
  if (
    lower.includes('spx') ||
    lower.includes('marketplace')
  ) {
    return { platform: 'spx_instant', label: 'SPX Instant' }
  }
  return null
}

function cleanOcrNumber(raw: string): number {
  const cleaned = raw
    .replace(/[oO]/g, '0')
    .replace(/[lI]/g, '1')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
  return parseInt(cleaned, 10) || 0
}

function extractAmount(text: string): number {
  const patterns = [
    /[Rr][Pp]\s?([\d.,\s]+\d)/g,
    /[Rr][Pp]([\d.,\s]+\d)/g,
  ]
  let best = 0
  for (const re of patterns) {
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) {
      const num = cleanOcrNumber(match[1] ?? '0')
      if (num >= 1000 && num <= 500000 && num > best) {
        best = num
      }
    }
  }
  if (best === 0) {
    const fallback = /([\d.]{4,})/g
    let m2: RegExpExecArray | null
    while ((m2 = fallback.exec(text)) !== null) {
      const num = cleanOcrNumber(m2[1] ?? '0')
      if (num >= 5000 && num <= 500000 && num > best) {
        best = num
      }
    }
  }
  return best
}

function parseOrders(rawText: string): {
  date: string | null
  orders: DetectedOrder[]
} {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const detectedDate = parseDate(rawText)
  const orders: DetectedOrder[] = []
  const usedLines = new Set<number>()

  const timeRe = /^(\d{1,2})[:.](\d{2})\b/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const timeMatch = timeRe.exec(line)
    if (!timeMatch) continue

    const hourNum = parseInt(timeMatch[1] ?? '0', 10)
    if (hourNum > 23) continue

    const hour = String(hourNum).padStart(2, '0')
    const min = timeMatch[2] ?? '00'
    const orderTime = `${hour}:${min}`

    const window: string[] = []
    const windowRange = 4
    for (
      let j = Math.max(0, i - 1);
      j <= Math.min(lines.length - 1, i + windowRange);
      j++
    ) {
      window.push(lines[j] ?? '')
    }
    const context = window.join(' ')

    const fareAmount = extractAmount(context)
    if (fareAmount < 1000) continue

    const platformInfo = detectPlatform(context)
    if (!platformInfo) continue

    if (usedLines.has(i)) continue
    usedLines.add(i)

    const isCombined =
      context.toLowerCase().includes('gabungan')

    orders.push({
      order_time: orderTime,
      platform: platformInfo.platform,
      platform_label: platformInfo.label,
      fare_amount: fareAmount,
      order_type: isCombined ? 'combined' : 'single',
      raw_line: line,
    })
  }

  return { date: detectedDate, orders }
}

function isBlobLike(value: unknown): value is Blob {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in (value as Record<string, unknown>) &&
    'size' in (value as Record<string, unknown>)
  )
}

// POST /api/ocr-orders
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
    if (!contentType.includes('multipart/form-data')) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Content-Type harus multipart/form-data' },
        400
      )
    }

    const formData = await c.req.formData()
    const file = formData.get('file')
    if (!file || !isBlobLike(file)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'File gambar wajib diupload' },
        400
      )
    }

    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp',
    ]
    if (!validTypes.includes(file.type)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Format: JPG, PNG, atau WebP' },
        400
      )
    }

    const ocrForm = new FormData()
    ocrForm.append('file', file)
    ocrForm.append('apikey', apiKey)
    ocrForm.append('language', 'eng')
    ocrForm.append('isOverlayRequired', 'false')
    ocrForm.append('OCREngine', '2')

    const ocrRes = await fetch(
      'https://api.ocr.space/parse/image',
      { method: 'POST', body: ocrForm }
    )

    if (!ocrRes.ok) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `OCR error: ${ocrRes.status}` },
        502
      )
    }

    const ocrData = await ocrRes.json() as OcrSpaceResult
    if (ocrData.IsErroredOnProcessing) {
      const msg =
        ocrData.ErrorMessage?.join(', ') || 'OCR gagal'
      return c.json<ApiResponse<never>>(
        { success: false, error: msg }, 502
      )
    }

    const rawText =
      ocrData.ParsedResults?.[0]?.ParsedText?.trim() || ''

    if (!rawText) {
      return c.json<ApiResponse<unknown>>({
        success: true,
        data: {
          raw_text: '',
          detected_date: null,
          orders: [],
          total_fare: 0,
          order_count: 0,
          message:
            'Gambar tidak terbaca. Coba screenshot lebih jelas.',
        },
      })
    }

    const { date, orders } = parseOrders(rawText)
    const totalFare = orders.reduce(
      (sum, o) => sum + o.fare_amount, 0
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        raw_text: rawText,
        detected_date: date,
        orders,
        total_fare: totalFare,
        order_count: orders.length,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Server error',
    }, 500)
  }
})

export { route as ocrOrdersRoute }
