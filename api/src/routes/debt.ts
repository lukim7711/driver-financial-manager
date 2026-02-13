import { Hono } from 'hono'
import type { ApiResponse } from '../types'

type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
}

const route = new Hono<{ Bindings: Bindings }>()

function getDB(env: Bindings) {
  const id = env.DB.idFromName('default')
  return env.DB.get(id)
}

async function queryDB(
  db: DurableObjectStub,
  sql: string,
  params: unknown[] = []
) {
  const res = await db.fetch(
    new Request('http://do/query', {
      method: 'POST',
      body: JSON.stringify({ query: sql, params }),
    })
  )
  const result = (await res.json()) as ApiResponse<
    Record<string, unknown>[]
  >
  return result.data || []
}

function getTodayISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(
    now.getTime() + offset * 60 * 1000
  )
  return local.toISOString().slice(0, 10)
}

function getNowISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(
    now.getTime() + offset * 60 * 1000
  )
  const iso = local.toISOString().slice(0, 19)
  return `${iso}+07:00`
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

interface ScheduleInput {
  due_date: string
  amount: number
}

function autoGenerateSchedules(
  dueDay: number,
  monthlyAmount: number,
  totalInstallments: number,
  totalOriginal: number
): ScheduleInput[] {
  const items: ScheduleInput[] = []
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(
    now.getTime() + offset * 60 * 1000
  )
  let year = local.getFullYear()
  let month = local.getMonth()
  let remaining = totalOriginal

  for (let i = 0; i < totalInstallments; i++) {
    const day = Math.min(
      dueDay,
      new Date(year, month + 1, 0).getDate()
    )
    const dd = String(day).padStart(2, '0')
    const mm = String(month + 1).padStart(2, '0')
    const dueDate = `${year}-${mm}-${dd}`
    const isLast = i === totalInstallments - 1
    const amt = isLast
      ? remaining
      : Math.min(monthlyAmount, remaining)
    remaining -= amt

    items.push({ due_date: dueDate, amount: amt })
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }
  return items
}

// GET /api/debts
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const today = getTodayISO()

    const debtRows = await queryDB(
      db,
      `SELECT * FROM debts
       WHERE is_deleted = 0 OR is_deleted IS NULL
       ORDER BY id`
    )
    const scheduleRows = await queryDB(
      db,
      `SELECT * FROM debt_schedule
       ORDER BY due_date ASC`
    )

    let totalOriginal = 0
    let totalRemaining = 0

    const debts = debtRows.map((d) => {
      const orig = Number(d.total_original) || 0
      const rem = Number(d.total_remaining) || 0
      totalOriginal += orig
      totalRemaining += rem
      const paid = orig - rem
      const pct =
        orig > 0
          ? Math.round((paid / orig) * 100)
          : 0

      const schedules = scheduleRows
        .filter((s) => s.debt_id === d.id)
        .map((s) => ({
          id: String(s.id),
          due_date: String(s.due_date),
          amount: Number(s.amount) || 0,
          status: String(s.status),
          paid_date: s.paid_date
            ? String(s.paid_date)
            : null,
          paid_amount: s.paid_amount
            ? Number(s.paid_amount)
            : null,
        }))

      const nextSchedule =
        schedules.find(
          (s) => s.status === 'unpaid'
        ) || null
      let daysUntil: number | null = null
      if (nextSchedule) {
        const diffMs =
          new Date(nextSchedule.due_date).getTime() -
          new Date(today).getTime()
        daysUntil = Math.ceil(
          diffMs / (1000 * 60 * 60 * 24)
        )
      }

      return {
        id: String(d.id),
        platform: String(d.platform),
        debt_type: d.debt_type
          ? String(d.debt_type)
          : 'installment',
        total_original: orig,
        total_remaining: rem,
        monthly_installment:
          Number(d.monthly_installment) || 0,
        due_day: Number(d.due_day) || 0,
        late_fee_type: String(d.late_fee_type),
        late_fee_rate:
          Number(d.late_fee_rate) || 0,
        total_installments:
          Number(d.total_installments) || 0,
        paid_installments:
          Number(d.paid_installments) || 0,
        progress_percentage: pct,
        note: d.note ? String(d.note) : '',
        next_schedule: nextSchedule
          ? {
              ...nextSchedule,
              days_until: daysUntil,
            }
          : null,
        schedules,
      }
    })

    debts.sort((a, b) => {
      const aN = a.next_schedule?.days_until ?? 999
      const bN = b.next_schedule?.days_until ?? 999
      return aN - bN
    })

    const totalPaid = totalOriginal - totalRemaining
    const progressPct =
      totalOriginal > 0
        ? Math.round(
            (totalPaid / totalOriginal) * 100
          )
        : 0

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        summary: {
          total_original: totalOriginal,
          total_remaining: totalRemaining,
          total_paid: totalPaid,
          progress_percentage: progressPct,
        },
        debts,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

// POST /api/debts — unified create
route.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      platform?: string
      total_original?: number
      monthly_installment?: number
      due_day?: number
      total_installments?: number
      late_fee_type?: string
      late_fee_rate?: number
      note?: string
      schedules?: ScheduleInput[]
    }>()

    if (
      !body.platform ||
      body.platform.trim().length === 0
    ) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Nama wajib diisi',
        },
        400
      )
    }
    if (body.platform.trim().length > 50) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Nama max 50 karakter',
        },
        400
      )
    }
    if (
      body.total_original === undefined ||
      !Number.isInteger(body.total_original) ||
      body.total_original <= 0
    ) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Total hutang harus integer > 0',
        },
        400
      )
    }

    let scheduleItems: ScheduleInput[]

    if (
      body.schedules &&
      Array.isArray(body.schedules) &&
      body.schedules.length > 0
    ) {
      // Custom schedules from frontend
      for (const s of body.schedules) {
        if (
          !s.due_date ||
          !/^\d{4}-\d{2}-\d{2}$/.test(
            s.due_date
          )
        ) {
          return c.json<ApiResponse<never>>(
            {
              success: false,
              error:
                'Setiap jadwal harus punya due_date (YYYY-MM-DD)',
            },
            400
          )
        }
        if (
          !Number.isInteger(s.amount) ||
          s.amount <= 0
        ) {
          return c.json<ApiResponse<never>>(
            {
              success: false,
              error:
                'Setiap jadwal harus punya amount > 0',
            },
            400
          )
        }
      }

      const sum = body.schedules.reduce(
        (a, s) => a + s.amount,
        0
      )
      if (sum !== body.total_original) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: `Total jadwal (${sum}) != total hutang (${body.total_original})`,
          },
          400
        )
      }
      scheduleItems = body.schedules
    } else {
      // Auto-generate from shortcut fields
      const monthly =
        body.monthly_installment ?? 0
      const dueDay = body.due_day ?? 1
      const count =
        body.total_installments ?? 1

      if (
        !Number.isInteger(monthly) ||
        monthly <= 0
      ) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error:
              'Cicilan bulanan harus > 0 atau sediakan schedules[]',
          },
          400
        )
      }
      if (dueDay < 1 || dueDay > 31) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Tgl jatuh tempo 1-31',
          },
          400
        )
      }
      if (count < 1 || count > 120) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Jumlah cicilan 1-120',
          },
          400
        )
      }

      scheduleItems = autoGenerateSchedules(
        dueDay,
        monthly,
        count,
        body.total_original
      )
    }

    const lateFeeType =
      body.late_fee_type === 'pct_daily'
        ? 'pct_daily'
        : 'pct_monthly'
    const lateFeeRate =
      typeof body.late_fee_rate === 'number' &&
      body.late_fee_rate >= 0
        ? body.late_fee_rate
        : 0
    const note = body.note?.trim() ?? ''
    const firstDueDay = scheduleItems[0]
      ? parseInt(
          scheduleItems[0].due_date.slice(8, 10),
          10
        )
      : body.due_day ?? 1
    const monthlyEst =
      body.monthly_installment ??
      scheduleItems[0]?.amount ??
      0

    const id = generateId('debt')
    const createdAt = getNowISO()
    const db = getDB(c.env)

    await queryDB(
      db,
      `INSERT INTO debts
        (id, platform, total_original,
         total_remaining, monthly_installment,
         due_day, late_fee_type, late_fee_rate,
         total_installments, paid_installments,
         is_deleted, created_at, debt_type, note)
       VALUES (?,?,?,?,?,?,?,?,?,0,0,?,?,?)`,
      [
        id,
        body.platform.trim(),
        body.total_original,
        body.total_original,
        monthlyEst,
        firstDueDay,
        lateFeeType,
        lateFeeRate,
        scheduleItems.length,
        createdAt,
        scheduleItems.length === 1
          ? 'simple'
          : 'installment',
        note,
      ]
    )

    for (const s of scheduleItems) {
      const sid = generateId('ds')
      await queryDB(
        db,
        `INSERT INTO debt_schedule
          (id, debt_id, due_date, amount, status)
         VALUES (?,?,?,?,?)`,
        [
          sid,
          id,
          s.due_date,
          s.amount,
          'unpaid',
        ]
      )
    }

    return c.json<
      ApiResponse<{
        id: string
        platform: string
      }>
    >(
      {
        success: true,
        data: {
          id,
          platform: body.platform.trim(),
        },
      },
      201
    )
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

// PUT /api/debts/:id
route.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json<{
      platform?: string
      total_original?: number
      monthly_installment?: number
      due_day?: number
      total_installments?: number
      late_fee_type?: string
      late_fee_rate?: number
      note?: string
    }>()

    const db = getDB(c.env)
    const existing = await queryDB(
      db,
      `SELECT * FROM debts
       WHERE id = ?
         AND (is_deleted = 0
              OR is_deleted IS NULL)`,
      [id]
    )
    if (existing.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Hutang tidak ditemukan',
        },
        404
      )
    }

    const updates: string[] = []
    const params: unknown[] = []

    if (body.platform !== undefined) {
      if (body.platform.trim().length === 0) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Nama wajib diisi',
          },
          400
        )
      }
      updates.push('platform = ?')
      params.push(body.platform.trim())
    }
    if (body.total_original !== undefined) {
      if (
        !Number.isInteger(body.total_original) ||
        body.total_original <= 0
      ) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Total harus integer > 0',
          },
          400
        )
      }
      const oldOrig =
        Number(existing[0]!.total_original) || 0
      const oldRem =
        Number(existing[0]!.total_remaining) || 0
      const paidSoFar = oldOrig - oldRem
      const newRem = Math.max(
        body.total_original - paidSoFar,
        0
      )
      updates.push('total_original = ?')
      params.push(body.total_original)
      updates.push('total_remaining = ?')
      params.push(newRem)
    }
    if (body.monthly_installment !== undefined) {
      updates.push('monthly_installment = ?')
      params.push(body.monthly_installment)
    }
    if (body.due_day !== undefined) {
      updates.push('due_day = ?')
      params.push(body.due_day)
    }
    if (body.total_installments !== undefined) {
      updates.push('total_installments = ?')
      params.push(body.total_installments)
    }
    if (body.late_fee_type !== undefined) {
      updates.push('late_fee_type = ?')
      params.push(
        body.late_fee_type === 'pct_daily'
          ? 'pct_daily'
          : 'pct_monthly'
      )
    }
    if (body.late_fee_rate !== undefined) {
      updates.push('late_fee_rate = ?')
      params.push(
        Math.max(body.late_fee_rate, 0)
      )
    }
    if (body.note !== undefined) {
      updates.push('note = ?')
      params.push(body.note.trim())
    }
    if (updates.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Tidak ada field untuk diupdate',
        },
        400
      )
    }

    params.push(id)
    await queryDB(
      db,
      `UPDATE debts
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    )

    const rows = await queryDB(
      db,
      `SELECT * FROM debts WHERE id = ?`,
      [id]
    )
    const row = rows[0]
    return c.json<
      ApiResponse<{
        id: string
        platform: string
        total_original: number
        total_remaining: number
      }>
    >({
      success: true,
      data: {
        id: String(row!.id),
        platform: String(row!.platform),
        total_original:
          Number(row!.total_original) || 0,
        total_remaining:
          Number(row!.total_remaining) || 0,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

// DELETE /api/debts/:id
route.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getDB(c.env)
    const existing = await queryDB(
      db,
      `SELECT id FROM debts
       WHERE id = ?
         AND (is_deleted = 0
              OR is_deleted IS NULL)`,
      [id]
    )
    if (existing.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Hutang tidak ditemukan',
        },
        404
      )
    }
    await queryDB(
      db,
      `UPDATE debts
       SET is_deleted = 1
       WHERE id = ?`,
      [id]
    )
    await queryDB(
      db,
      `DELETE FROM debt_schedule
       WHERE debt_id = ?`,
      [id]
    )
    return c.json<
      ApiResponse<{ deleted: string }>
    >({
      success: true,
      data: { deleted: id },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

// PUT /api/debts/:id/schedules/:sid
route.put('/:id/schedules/:sid', async (c) => {
  try {
    const debtId = c.req.param('id')
    const sid = c.req.param('sid')
    const body = await c.req.json<{
      amount?: number
      due_date?: string
    }>()

    const db = getDB(c.env)
    const debtRows = await queryDB(
      db,
      `SELECT * FROM debts
       WHERE id = ?
         AND (is_deleted = 0
              OR is_deleted IS NULL)`,
      [debtId]
    )
    if (debtRows.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Hutang tidak ditemukan',
        },
        404
      )
    }
    const schedRows = await queryDB(
      db,
      `SELECT * FROM debt_schedule
       WHERE id = ? AND debt_id = ?`,
      [sid, debtId]
    )
    if (schedRows.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Jadwal tidak ditemukan',
        },
        404
      )
    }
    if (schedRows[0]!.status === 'paid') {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Tidak bisa edit yang sudah dibayar',
        },
        400
      )
    }

    const updates: string[] = []
    const params: unknown[] = []
    const oldAmount =
      Number(schedRows[0]!.amount) || 0

    if (body.amount !== undefined) {
      if (
        !Number.isInteger(body.amount) ||
        body.amount <= 0
      ) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Nominal harus integer > 0',
          },
          400
        )
      }
      updates.push('amount = ?')
      params.push(body.amount)
    }
    if (body.due_date !== undefined) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          body.due_date
        )
      ) {
        return c.json<ApiResponse<never>>(
          {
            success: false,
            error: 'Format: YYYY-MM-DD',
          },
          400
        )
      }
      updates.push('due_date = ?')
      params.push(body.due_date)
    }
    if (updates.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Tidak ada yang diupdate',
        },
        400
      )
    }

    params.push(sid)
    await queryDB(
      db,
      `UPDATE debt_schedule
       SET ${updates.join(', ')}
       WHERE id = ?`,
      params
    )

    if (body.amount !== undefined) {
      const diff = body.amount - oldAmount
      await queryDB(
        db,
        `UPDATE debts
         SET total_original =
               total_original + ?,
             total_remaining =
               total_remaining + ?
         WHERE id = ?`,
        [diff, diff, debtId]
      )
    }

    return c.json<
      ApiResponse<{
        schedule_id: string
        updated: boolean
      }>
    >({
      success: true,
      data: { schedule_id: sid, updated: true },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

// POST /api/debts/:id/pay
route.post('/:id/pay', async (c) => {
  try {
    const debtId = c.req.param('id')
    const body = await c.req.json<{
      schedule_id: string
      amount: number
      is_full_payment?: boolean
    }>()
    const { schedule_id, amount } = body

    if (!schedule_id || !amount || amount <= 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error:
            'schedule_id dan amount wajib, amount > 0',
        },
        400
      )
    }

    const db = getDB(c.env)
    const schedRows = await queryDB(
      db,
      `SELECT * FROM debt_schedule
       WHERE id = ?`,
      [schedule_id]
    )
    if (schedRows.length === 0) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Schedule tidak ditemukan',
        },
        404
      )
    }
    const sched = schedRows[0]!
    if (sched.status === 'paid') {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Cicilan sudah lunas',
        },
        400
      )
    }

    const schedAmount =
      Number(sched.amount) || 0
    const prevPaid =
      Number(sched.paid_amount) || 0
    const remaining = schedAmount - prevPaid

    if (amount > remaining) {
      return c.json<ApiResponse<never>>(
        {
          success: false,
          error: `Maks: Rp ${remaining.toLocaleString('id-ID')}`,
        },
        400
      )
    }

    const newPaidAmount = prevPaid + amount
    const nowFull = newPaidAmount >= schedAmount
    const newStatus = nowFull ? 'paid' : 'unpaid'
    const today = getTodayISO()
    const createdAt = getNowISO()
    const txId = crypto.randomUUID()

    await queryDB(
      db,
      `INSERT INTO transactions
        (id, created_at, type, amount,
         category, note, source,
         debt_id, is_deleted)
       VALUES
        (?,?,'debt_payment',?,'debt',
         ?,'manual',?,0)`,
      [
        txId,
        createdAt,
        amount,
        `Bayar ${String(sched.debt_id)}`,
        debtId,
      ]
    )
    await queryDB(
      db,
      `UPDATE debt_schedule
       SET status = ?, paid_date = ?,
           paid_amount = ?
       WHERE id = ?`,
      [
        newStatus,
        nowFull ? today : null,
        newPaidAmount,
        schedule_id,
      ]
    )
    await queryDB(
      db,
      `UPDATE debts
       SET total_remaining =
             total_remaining - ?,
           paid_installments =
             paid_installments + ?
       WHERE id = ?`,
      [amount, nowFull ? 1 : 0, debtId]
    )

    const debtRows = await queryDB(
      db,
      `SELECT * FROM debts WHERE id = ?`,
      [debtId]
    )
    const debt = debtRows[0]
    const newRemaining = debt
      ? Number(debt.total_remaining) || 0
      : 0
    const platform = debt
      ? String(debt.platform)
      : debtId

    return c.json<ApiResponse<unknown>>(
      {
        success: true,
        data: {
          debt_id: debtId,
          platform,
          paid_amount: amount,
          remaining: newRemaining,
          schedule_status: newStatus,
          is_fully_paid: newRemaining <= 0,
        },
      },
      201
    )
  } catch (error) {
    return c.json<ApiResponse<never>>(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Server error',
      },
      500
    )
  }
})

export { route as debtRoute }
