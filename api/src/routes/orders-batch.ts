import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'
import { getNowISO } from '../utils/date'
import { generateId } from '../utils/id'

const route = new Hono<{ Bindings: Bindings }>()

interface OrderInput {
  order_time: string
  platform: string
  fare_amount: number
  order_type: string
}

interface BatchRequest {
  date: string
  orders: OrderInput[]
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDate()
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  const month = months[d.getMonth()] ?? 'Jan'
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

// POST /api/orders/batch
route.post('/batch', async (c) => {
  try {
    const body = await c.req.json<BatchRequest>()
    const { date, orders } = body

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Tanggal wajib (YYYY-MM-DD)' },
        400
      )
    }
    if (!orders || orders.length === 0) {
      return c.json<ApiResponse<never>>(
        { success: false, error: 'Minimal 1 order' },
        400
      )
    }

    const db = getDB(c.env)
    const now = getNowISO()

    // Check duplicates: same date + time + amount
    const existingRows = await queryDB(db,
      `SELECT order_time, fare_amount FROM orders
       WHERE order_date = ? AND is_deleted = 0`,
      [date]
    )
    const existingSet = new Set(
      existingRows.map((r) =>
        `${String(r.order_time)}-${Number(r.fare_amount)}`
      )
    )

    const newOrders = orders.filter((o) =>
      !existingSet.has(`${o.order_time}-${o.fare_amount}`)
    )

    if (newOrders.length === 0) {
      return c.json<ApiResponse<unknown>>({
        success: true,
        data: {
          orders_saved: 0,
          orders_skipped: orders.length,
          total_income: 0,
          transaction_id: null,
          message: 'Semua order sudah tersimpan sebelumnya',
        },
      })
    }

    const totalFare = newOrders.reduce(
      (sum, o) => sum + o.fare_amount, 0
    )

    // Create 1 income transaction
    const txnId = generateId('txn')
    const dateLabel = formatDateLabel(date)
    const note = `${newOrders.length} order Shopee (${dateLabel})`

    await queryDB(db,
      `INSERT INTO transactions
        (id, created_at, type, amount, category,
         note, source, is_deleted)
       VALUES (?, ?, 'income', ?, 'order',
               ?, 'ocr_order', 0)`,
      [txnId, `${date}T23:59:00+07:00`, totalFare, note]
    )

    // Insert each order
    for (const o of newOrders) {
      const orderId = generateId('ord')
      await queryDB(db,
        `INSERT INTO orders
          (id, transaction_id, order_date,
           order_time, platform, fare_amount,
           order_type, is_deleted, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          orderId, txnId, date,
          o.order_time, o.platform, o.fare_amount,
          o.order_type || 'single', now,
        ]
      )
    }

    const skipped = orders.length - newOrders.length

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        orders_saved: newOrders.length,
        orders_skipped: skipped,
        total_income: totalFare,
        transaction_id: txnId,
      },
    })
  } catch (error) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: error instanceof Error
        ? error.message : 'Server error',
    }, 500)
  }
})

export { route as ordersBatchRoute }
