import { Hono } from 'hono'
import type { ApiResponse } from '../types'
import type { Bindings } from '../utils/db'
import { getDB, queryDB } from '../utils/db'

const route = new Hono<{ Bindings: Bindings }>()

interface BudgetSettings {
  budget_bbm: number
  budget_makan: number
  budget_rokok: number
  budget_pulsa: number
}

const DEFAULT_BUDGETS: BudgetSettings = {
  budget_bbm: 40000,
  budget_makan: 25000,
  budget_rokok: 27000,
  budget_pulsa: 5000,
}

const BUDGET_KEYS = Object.keys(
  DEFAULT_BUDGETS
) as (keyof BudgetSettings)[]
const DEFAULT_TARGET_DATE = '2026-04-13'
const DEFAULT_REST_DAYS = '0' // Sunday

// GET /api/settings
route.get('/', async (c) => {
  try {
    const db = getDB(c.env)
    const rows = await queryDB(db,
      `SELECT key, value FROM settings
       WHERE key LIKE 'budget_%'
          OR key = 'debt_target_date'
          OR key = 'rest_days'`
    )

    const settings: BudgetSettings = {
      ...DEFAULT_BUDGETS,
    }
    let debtTargetDate = DEFAULT_TARGET_DATE
    let restDays = DEFAULT_REST_DAYS

    for (const row of rows) {
      const key = String(row.key)
      if (key === 'debt_target_date') {
        debtTargetDate = String(row.value)
      } else if (key === 'rest_days') {
        restDays = String(row.value)
      } else if (
        BUDGET_KEYS.includes(
          key as keyof BudgetSettings
        )
      ) {
        settings[key as keyof BudgetSettings] =
          Number(row.value) ||
          DEFAULT_BUDGETS[key as keyof BudgetSettings]
      }
    }

    const dailyTotal =
      settings.budget_bbm +
      settings.budget_makan +
      settings.budget_rokok +
      settings.budget_pulsa

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        ...settings,
        daily_total: dailyTotal,
        debt_target_date: debtTargetDate,
        rest_days: restDays,
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

// PUT /api/settings
route.put('/', async (c) => {
  try {
    const body = await c.req.json<
      Partial<BudgetSettings> & {
        debt_target_date?: string
        rest_days?: string
      }
    >()
    const db = getDB(c.env)

    const updates: { key: string; value: string }[] =
      []

    for (const key of BUDGET_KEYS) {
      if (body[key] !== undefined) {
        const val = Number(body[key])
        if (!Number.isInteger(val) || val < 0) {
          return c.json<ApiResponse<never>>({
            success: false,
            error: `${key} harus integer >= 0`,
          }, 400)
        }
        updates.push({ key, value: String(val) })
      }
    }

    if (body.debt_target_date !== undefined) {
      const dateStr = body.debt_target_date
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return c.json<ApiResponse<never>>({
          success: false,
          error: 'debt_target_date harus format YYYY-MM-DD',
        }, 400)
      }
      const parsed = new Date(dateStr)
      if (isNaN(parsed.getTime())) {
        return c.json<ApiResponse<never>>({
          success: false,
          error: 'debt_target_date bukan tanggal valid',
        }, 400)
      }
      updates.push({
        key: 'debt_target_date',
        value: dateStr,
      })
    }

    if (body.rest_days !== undefined) {
      const raw = body.rest_days.trim()
      // Validate: empty string or comma-separated 0-6
      if (raw !== '') {
        const parts = raw.split(',')
        const valid = parts.every((p) => {
          const n = parseInt(p.trim(), 10)
          return !isNaN(n) && n >= 0 && n <= 6
        })
        if (!valid) {
          return c.json<ApiResponse<never>>({
            success: false,
            error: 'rest_days: angka 0-6 dipisah koma (0=Minggu)',
          }, 400)
        }
      }
      updates.push({ key: 'rest_days', value: raw })
    }

    if (updates.length === 0) {
      return c.json<ApiResponse<never>>({
        success: false,
        error: 'Tidak ada pengaturan yang diupdate',
      }, 400)
    }

    for (const u of updates) {
      await queryDB(db,
        `INSERT INTO settings (key, value)
         VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE
         SET value = excluded.value`,
        [u.key, u.value]
      )
    }

    // Refetch all
    const refetchRows = await queryDB(db,
      `SELECT key, value FROM settings
       WHERE key LIKE 'budget_%'
          OR key = 'debt_target_date'
          OR key = 'rest_days'`
    )
    const settings: BudgetSettings = {
      ...DEFAULT_BUDGETS,
    }
    let debtTargetDate = DEFAULT_TARGET_DATE
    let restDays = DEFAULT_REST_DAYS

    for (const row of refetchRows) {
      const key = String(row.key)
      if (key === 'debt_target_date') {
        debtTargetDate = String(row.value)
      } else if (key === 'rest_days') {
        restDays = String(row.value)
      } else if (
        BUDGET_KEYS.includes(
          key as keyof BudgetSettings
        )
      ) {
        settings[key as keyof BudgetSettings] =
          Number(row.value) ||
          DEFAULT_BUDGETS[key as keyof BudgetSettings]
      }
    }

    const dailyTotal =
      settings.budget_bbm +
      settings.budget_makan +
      settings.budget_rokok +
      settings.budget_pulsa

    return c.json<ApiResponse<unknown>>({
      success: true,
      data: {
        ...settings,
        daily_total: dailyTotal,
        debt_target_date: debtTargetDate,
        rest_days: restDays,
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

export { route as settingsRoute }
