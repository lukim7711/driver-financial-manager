import { Hono } from 'hono'
import type { ApiResponse, MonthlyExpense } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'
import { getNowISO } from '../utils/date'
import { generateId } from '../utils/id'

const route = new Hono<{ Bindings: Bindings }>()

const VALID_EMOJIS = [
  '\ud83c\udfe0', '\ud83d\udca1', '\ud83d\udca7', '\ud83d\udcf6', '\ud83d\udd0c', '\ud83c\udfe5', '\ud83c\udf93',
  '\ud83d\udcfa', '\ud83d\ude97', '\ud83d\udee1\ufe0f', '\ud83d\udce6', '\ud83e\uddf9', '\ud83d\udc76', '\ud83d\udc3e',
]

// GET /api/monthly-expenses
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const rows = await queryDB(db,
      `SELECT id, name, emoji, amount, created_at
       FROM monthly_expenses
       WHERE is_deleted = 0
       ORDER BY created_at ASC`
    )

    const items: MonthlyExpense[] = rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      emoji: String(row.emoji),
      amount: Number(row.amount) || 0,
      is_deleted: 0,
      created_at: String(row.created_at),
    }))

    const total = items.reduce((s, i) => s + i.amount, 0)

    return c.json<ApiResponse<{
      items: MonthlyExpense[]
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

// POST /api/monthly-expenses
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

    const id = generateId('me')
    const createdAt = getNowISO()
    const db = getDB(c.env)

    await queryDB(db,
      `INSERT INTO monthly_expenses
        (id, name, emoji, amount, is_deleted, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, body.name.trim(), emoji, body.amount, createdAt]
    )

    const item: MonthlyExpense = {
      id,
      name: body.name.trim(),
      emoji,
      amount: body.amount,
      is_deleted: 0,
      created_at: createdAt,
    }

    return c.json<ApiResponse<MonthlyExpense>>(
      { success: true, data: item },
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

// PUT /api/monthly-expenses/:id
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
      `SELECT id FROM monthly_expenses
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
      `UPDATE monthly_expenses
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    )

    const rows = await queryDB(db,
      `SELECT id, name, emoji, amount, created_at
       FROM monthly_expenses WHERE id = ?`,
      [id]
    )
    const row = rows[0]
    if (!row) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Item tidak ditemukan setelah update' },
        404
      )
    }
    const item: MonthlyExpense = {
      id: String(row.id),
      name: String(row.name),
      emoji: String(row.emoji),
      amount: Number(row.amount) || 0,
      is_deleted: 0,
      created_at: String(row.created_at),
    }

    return c.json<ApiResponse<MonthlyExpense>>(
      { success: true, data: item }
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

// DELETE /api/monthly-expenses/:id
route.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDB(c.env)

    const existing = await queryDB(db,
      `SELECT id FROM monthly_expenses
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
      `UPDATE monthly_expenses
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

export { route as monthlyExpenseRoute }
