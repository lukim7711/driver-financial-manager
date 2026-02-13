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

async function queryDB(db: DurableObjectStub, sql: string, params: unknown[] = []) {
  const res = await db.fetch(new Request('http://do/query', {
    method: 'POST',
    body: JSON.stringify({ query: sql, params }),
  }))
  const result = await res.json() as ApiResponse<Record<string, unknown>[]>
  return result.data || []
}

function getTodayISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

function getNowISO(): string {
  const now = new Date()
  const offset = 7 * 60
  const local = new Date(now.getTime() + offset * 60 * 1000)
  const iso = local.toISOString().slice(0, 19)
  return `${iso}+07:00`
}

// GET /api/debts
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const today = getTodayISO()

    const debtRows = await queryDB(db,
      `SELECT * FROM debts ORDER BY id`
    )

    const scheduleRows = await queryDB(db,
      `SELECT * FROM debt_schedule ORDER BY due_date ASC`
    )

    let totalOriginal = 0
    let totalRemaining = 0

    const debts = debtRows.map((d) => {
      const orig = Number(d.total_original) || 0
      const rem = Number(d.total_remaining) || 0
      totalOriginal += orig
      totalRemaining += rem
      const paid = orig - rem
      const pct = orig > 0 ? Math.round((paid / orig) * 100) : 0

      const schedules = scheduleRows
        .filter((s) => s.debt_id === d.id)
        .map((s) => ({
          id: String(s.id),
          due_date: String(s.due_date),
          amount: Number(s.amount) || 0,
          status: String(s.status),
          paid_date: s.paid_date ? String(s.paid_date) : null,
          paid_amount: s.paid_amount ? Number(s.paid_amount) : null,
        }))

      const nextSchedule = schedules.find((s) => s.status === 'unpaid') || null
      let daysUntil: number | null = null
      if (nextSchedule) {
        const diffMs = new Date(nextSchedule.due_date).getTime() - new Date(today).getTime()
        daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      }

      return {
        id: String(d.id),
        platform: String(d.platform),
        total_original: orig,
        total_remaining: rem,
        monthly_installment: Number(d.monthly_installment) || 0,
        due_day: Number(d.due_day) || 0,
        late_fee_type: String(d.late_fee_type),
        late_fee_rate: Number(d.late_fee_rate) || 0,
        total_installments: Number(d.total_installments) || 0,
        paid_installments: Number(d.paid_installments) || 0,
        progress_percentage: pct,
        next_schedule: nextSchedule ? {
          ...nextSchedule,
          days_until: daysUntil,
        } : null,
        schedules,
      }
    })

    // Sort by urgency
    debts.sort((a, b) => {
      const aNext = a.next_schedule?.days_until ?? 999
      const bNext = b.next_schedule?.days_until ?? 999
      return aNext - bNext
    })

    const totalPaid = totalOriginal - totalRemaining
    const progressPct = totalOriginal > 0
      ? Math.round((totalPaid / totalOriginal) * 100)
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
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
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
      is_full_payment: boolean
    }>()
    const { schedule_id, amount, is_full_payment } = body

    if (!schedule_id || !amount || amount <= 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'schedule_id dan amount wajib, amount > 0' },
        400
      )
    }

    const db = getDB(c.env)

    // Fetch schedule
    const schedRows = await queryDB(db,
      `SELECT * FROM debt_schedule WHERE id = ?`,
      [schedule_id]
    )
    if (schedRows.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Schedule tidak ditemukan' },
        404
      )
    }
    const sched = schedRows[0]!
    if (sched.status === 'paid') {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Cicilan sudah lunas' },
        400
      )
    }

    const schedAmount = Number(sched.amount) || 0
    const prevPaid = Number(sched.paid_amount) || 0
    const remaining = schedAmount - prevPaid

    if (amount > remaining) {
      return c.json<ApiResponse<never>>(
        { success: false, error: `Maksimal pembayaran: Rp ${remaining.toLocaleString('id-ID')}` },
        400
      )
    }

    const newPaidAmount = prevPaid + amount
    const nowFull = newPaidAmount >= schedAmount
    const newStatus = nowFull ? 'paid' : 'unpaid'
    const today = getTodayISO()
    const createdAt = getNowISO()
    const txId = crypto.randomUUID()

    // 1. Insert transaction
    await queryDB(db,
      `INSERT INTO transactions (id, created_at, type, amount, category, note, source, debt_id, is_deleted)
       VALUES (?, ?, 'debt_payment', ?, 'debt', ?, 'manual', ?, 0)`,
      [txId, createdAt, amount, `Bayar ${sched.debt_id}`, debtId]
    )

    // 2. Update schedule
    await queryDB(db,
      `UPDATE debt_schedule
       SET status = ?, paid_date = ?, paid_amount = ?
       WHERE id = ?`,
      [newStatus, nowFull ? today : null, newPaidAmount, schedule_id]
    )

    // 3. Update debt remaining
    await queryDB(db,
      `UPDATE debts
       SET total_remaining = total_remaining - ?,
           paid_installments = paid_installments + ?
       WHERE id = ?`,
      [amount, nowFull ? 1 : 0, debtId]
    )

    // Fetch updated debt
    const debtRows = await queryDB(db,
      `SELECT * FROM debts WHERE id = ?`,
      [debtId]
    )
    const debt = debtRows[0]
    const newRemaining = debt ? Number(debt.total_remaining) || 0 : 0
    const platform = debt ? String(debt.platform) : debtId

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        debt_id: debtId,
        platform,
        paid_amount: amount,
        remaining: newRemaining,
        schedule_status: newStatus,
        is_fully_paid: newRemaining <= 0,
      },
    }, 201)
  } catch (error) {
    return c.json<ApiResponse<never>>(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      500
    )
  }
})

export { route as debtRoute }
