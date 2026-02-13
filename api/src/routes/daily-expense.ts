import { Hono } from 'hono'
import type { ApiResponse, DailyExpense } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'
import { getNowISO } from '../utils/date'
import { generateId } from '../utils/id'

const route = new Hono<{ Bindings: Bindings }>()

const VALID_EMOJIS = [
  '\u26fd', '\ud83c\udf5c', '\ud83d\udead', '\ud83d\udcf1', '\ud83c\udd7f\ufe0f', '\ud83d\udd27', '\ud83d\ude97',
  '\u2615', '\ud83d\udc8a', '\ud83e\uddca', '\ud83d\uded2', '\ud83d\udce6', '\ud83c\udfae', '\ud83c\udfcb\ufe0f',
]

function toItem(row: Record<string, unknown>): DailyExpense {
  return {
    id: String(row.id),
    name: String(row.name),
    emoji: String(row.emoji),
    amount: Number(row.amount) || 0,
    is_deleted: 0,
    created_at: String(row.created_at),
  }
}

// GET /api/daily-expenses
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const rows = await queryDB(db,
      `SELECT id, name, emoji, amount, created_at
       FROM daily_expenses
       WHERE is_deleted = 0
       ORDER BY created_at ASC`
    )

    const items = rows.map(toItem)
    const total = items.reduce((s, i) => s + i.amount, 0)

    return c.json<ApiResponse<{
      items: DailyExpense[]
      total: number
    }>>({
      success: true,
      data: { items, total },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Server error',
      },
      500
    )
  }
})

// POST /api/daily-expenses
route.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      name?: string
      emoji?: string
      amount?: number
    }>()

    if (!body.name || body.name.trim().length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Nama wajib diisi' },
        400
      )
    }
    if (body.name.trim().length > 30) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Nama maksimal 30 karakter' },
        400
      )
    }
    if (
      body.amount === undefined ||
      !Number.isInteger(body.amount) ||
      body.amount < 0
    ) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Amount harus integer >= 0' },
        400
      )
    }

    const emoji = body.emoji && VALID_EMOJIS.includes(body.emoji)
      ? body.emoji
      : '\ud83d\udce6'

    const id = generateId('de')
    const createdAt = getNowISO()
    const db = getDB(c.env)

    await queryDB(db,
      `INSERT INTO daily_expenses
        (id, name, emoji, amount, is_deleted, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, body.name.trim(), emoji, body.amount, createdAt]
    )

    return c.json<ApiResponse<DailyExpense>>(
      { success: true, data: toItem({
        id, name: body.name.trim(), emoji,
        amount: body.amount, created_at: createdAt,
      }) },
      201
    )
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Server error',
      },
      500
    )
  }
})

// PUT /api/daily-expenses/:id
route.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<{
      name?: string
      emoji?: string
      amount?: number
    }>()

    const db = getDB(c.env)

    const existing = await queryDB(db,
      `SELECT id FROM daily_expenses
       WHERE id = ? AND is_deleted = 0`,
      [id]
    )
    if (existing.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Item tidak ditemukan' },
        404
      )
    }

    const updates: string[] = []
    const params: unknown[] = []

    if (body.name !== undefined) {
      if (body.name.trim().length === 0) {
        return c.json<ApiResponse<never>>(
          { success: false, error: 'Nama wajib diisi' },
          400
        )
      }
      if (body.name.trim().length > 30) {
        return c.json<ApiResponse<never>>(
          { success: false, error: 'Nama maksimal 30 karakter' },
          400
        )
      }
      updates.push('name = ?')
      params.push(body.name.trim())
    }

    if (body.emoji !== undefined) {
      const emoji = VALID_EMOJIS.includes(body.emoji)
        ? body.emoji
        : '\ud83d\udce6'
      updates.push('emoji = ?')
      params.push(emoji)
    }

    if (body.amount !== undefined) {
      if (!Number.isInteger(body.amount) || body.amount < 0) {
        return c.json<ApiResponse<never>>(
          { success: false, error: 'Amount harus integer >= 0' },
          400
        )
      }
      updates.push('amount = ?')
      params.push(body.amount)
    }

    if (updates.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Tidak ada field yang diupdate' },
        400
      )
    }

    params.push(id)
    await queryDB(db,
      `UPDATE daily_expenses
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    )

    const rows = await queryDB(db,
      `SELECT id, name, emoji, amount, created_at
       FROM daily_expenses WHERE id = ?`,
      [id]
    )
    const row = rows[0]
    if (!row) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Item tidak ditemukan' },
        404
      )
    }

    return c.json<ApiResponse<DailyExpense>>(
      { success: true, data: toItem(row) }
    )
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Server error',
      },
      500
    )
  }
})

// DELETE /api/daily-expenses/:id
route.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDB(c.env)

    const existing = await queryDB(db,
      `SELECT id FROM daily_expenses
       WHERE id = ? AND is_deleted = 0`,
      [id]
    )
    if (existing.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Item tidak ditemukan' },
        404
      )
    }

    await queryDB(db,
      `UPDATE daily_expenses
       SET is_deleted = 1 WHERE id = ?`,
      [id]
    )

    return c.json<ApiResponse<{ deleted: string }>>({
      success: true,
      data: { deleted: id },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : 'Server error',
      },
      500
    )
  }
})

export { route as dailyExpenseRoute }
