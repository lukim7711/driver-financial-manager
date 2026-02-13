import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'
import { getNowISO } from '../utils/date'

const route = new Hono<{ Bindings: Bindings }>()

const VALID_TYPES = ['income', 'expense', 'debt_payment'] as const
const VALID_INCOME_CATS = ['order', 'tips', 'bonus', 'insentif', 'lainnya'] as const
const VALID_EXPENSE_CATS = ['bbm', 'makan', 'rokok', 'pulsa', 'parkir', 'service', 'rt', 'lainnya'] as const
const VALID_SOURCES = ['manual', 'ocr'] as const

// POST /api/transactions
route.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      type: string
      amount: number
      category: string
      note?: string
      source?: string
      debt_id?: string
    }>()

    const { type, amount, category, note, source, debt_id } = body

    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Invalid type. Must be: ${VALID_TYPES.join(', ')}` },
        400
      )
    }

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Amount harus integer positif (Rupiah)' },
        400
      )
    }

    if (type === 'income' && !VALID_INCOME_CATS.includes(category as typeof VALID_INCOME_CATS[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Invalid income category. Must be: ${VALID_INCOME_CATS.join(', ')}` },
        400
      )
    }

    if (type === 'expense' && !VALID_EXPENSE_CATS.includes(category as typeof VALID_EXPENSE_CATS[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Invalid expense category. Must be: ${VALID_EXPENSE_CATS.join(', ')}` },
        400
      )
    }

    const validSource = source && VALID_SOURCES.includes(source as typeof VALID_SOURCES[number])
      ? source
      : 'manual'

    const db = getDB(c.env)
    const id = crypto.randomUUID()
    const createdAt = getNowISO()

    await queryDB(db,
      `INSERT INTO transactions (id, created_at, type, amount, category, note, source, debt_id, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, createdAt, type, amount, category, note || '', validSource, debt_id || null]
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: { id, created_at: createdAt, type, amount, category, note: note || '', source: validSource },
    }, 201)
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

// GET /api/transactions
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const limit = Math.min(Number(c.req.query('limit')) || 50, 100)
    const offset = Math.max(Number(c.req.query('offset')) || 0, 0)

    const rows = await queryDB(db,
      `SELECT * FROM transactions WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: rows,
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

// PUT /api/transactions/:id
route.put('/:id', async (c) => {
  try {
    const txId = c.req.param('id')
    const db = getDB(c.env)

    const rows = await queryDB(db,
      `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
      [txId]
    )
    if (rows.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Transaksi tidak ditemukan' },
        404
      )
    }

    const existing = rows[0]!
    if (String(existing.type) === 'debt_payment') {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Transaksi pembayaran hutang tidak bisa diedit' },
        403
      )
    }

    const body = await c.req.json<{
      amount?: number
      category?: string
      note?: string
    }>()

    const newAmount = body.amount ?? Number(existing.amount)
    const newCategory = body.category ?? String(existing.category)
    const newNote = body.note ?? String(existing.note ?? '')

    if (newAmount <= 0 || !Number.isInteger(newAmount)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Amount harus integer positif' },
        400
      )
    }

    const type = String(existing.type)
    if (type === 'income' && !VALID_INCOME_CATS.includes(newCategory as typeof VALID_INCOME_CATS[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Invalid income category` },
        400
      )
    }
    if (type === 'expense' && !VALID_EXPENSE_CATS.includes(newCategory as typeof VALID_EXPENSE_CATS[number])) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Invalid expense category` },
        400
      )
    }

    const updatedAt = getNowISO()

    await queryDB(db,
      `UPDATE transactions SET amount = ?, category = ?, note = ? WHERE id = ?`,
      [newAmount, newCategory, newNote, txId]
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        id: txId,
        amount: newAmount,
        category: newCategory,
        note: newNote,
        updated_at: updatedAt,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

// DELETE /api/transactions/:id
route.delete('/:id', async (c) => {
  try {
    const txId = c.req.param('id')
    const db = getDB(c.env)

    const rows = await queryDB(db,
      `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
      [txId]
    )
    if (rows.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Transaksi tidak ditemukan' },
        404
      )
    }

    if (String(rows[0]!.type) === 'debt_payment') {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Transaksi pembayaran hutang tidak bisa dihapus' },
        403
      )
    }

    await queryDB(db,
      `UPDATE transactions SET is_deleted = 1 WHERE id = ?`,
      [txId]
    )

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: { id: txId, deleted: true },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as transactionRoute }
