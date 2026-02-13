import { Hono } from 'hono'
import type { ApiResponse, Transaction } from '../types'

const VALID_TYPES = ['income', 'expense', 'debt_payment'] as const

const VALID_CATEGORIES_INCOME = ['order', 'bonus', 'lainnya_masuk'] as const
const VALID_CATEGORIES_EXPENSE = [
  'bbm', 'makan', 'rokok', 'pulsa', 'parkir',
  'rt', 'service', 'lainnya_keluar',
] as const

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
}

const route = new Hono<{ Bindings: Bindings }>()

function getDB(env: Bindings) {
  const id = env.DB.idFromName('default')
  return env.DB.get(id)
}

function generateId(): string {
  return crypto.randomUUID()
}

function getNowISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  const iso = local.toISOString().slice(0, 19)
  return `${iso}+07:00`
}

interface CreateTransactionBody {
  type: string
  amount: number
  category: string
  note?: string
  source?: string
}

// POST /api/transactions
route.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateTransactionBody>()
    const { type, amount, category, note, source } = body

    // Validate type
    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Tipe harus income, expense, atau debt_payment' },
        400
      )
    }

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Nominal harus lebih dari 0' },
        400
      )
    }
    if (amount > 10_000_000) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Nominal maksimal Rp 10.000.000' },
        400
      )
    }

    // Validate category
    const allCategories = [
      ...VALID_CATEGORIES_INCOME,
      ...VALID_CATEGORIES_EXPENSE,
    ] as readonly string[]
    if (!category || !allCategories.includes(category)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Kategori tidak valid' },
        400
      )
    }

    const id = generateId()
    const createdAt = getNowISO()
    const txSource = source || 'manual'

    const db = getDB(c.env)
    const res = await db.fetch(new Request('http://do/query', {
      method: 'POST',
      body: JSON.stringify({
        query: `INSERT INTO transactions (id, created_at, type, amount, category, note, source, debt_id, is_deleted)
                VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
        params: [id, createdAt, type, amount, category, note || '', txSource],
      }),
    }))

    if (!res.ok) {
      const err = await res.json() as ApiResponse<never>
      return c.json<ApiResponse<never>>(
        { success: false, error: err.error || 'Gagal menyimpan transaksi' },
        500
      )
    }

    const txData: Transaction = {
      id,
      created_at: createdAt,
      type: type as Transaction['type'],
      amount,
      category,
      note: note || '',
      source: txSource as Transaction['source'],
      debt_id: null,
      is_deleted: 0,
    }

    return c.json<ApiResponse<Transaction>>({
      success: true,
      data: txData,
    }, 201)
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

// GET /api/transactions?date=YYYY-MM-DD
route.get('/', async (c) => {
  try {
    const date = c.req.query('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Parameter date wajib, format: YYYY-MM-DD' },
        400
      )
    }

    const db = getDB(c.env)
    const res = await db.fetch(new Request('http://do/query', {
      method: 'POST',
      body: JSON.stringify({
        query: `SELECT * FROM transactions
                WHERE created_at LIKE ? AND is_deleted = 0
                ORDER BY created_at DESC`,
        params: [`${date}%`],
      }),
    }))

    const result = await res.json() as ApiResponse<Transaction[]>
    return c.json<ApiResponse<Transaction[]>>({
      success: true,
      data: result.data || [],
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as transactionRoute }
