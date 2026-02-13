// ============================================================================
// Shared TypeScript Types — Frontend & Backend
// ============================================================================

export interface Transaction {
  id: string
  created_at: string
  type: 'income' | 'expense' | 'debt_payment'
  amount: number
  category: string
  note: string | null
  source: 'manual' | 'ocr'
  debt_id: string | null
  is_deleted: 0 | 1
}

export interface Debt {
  id: string
  platform: string
  total_original: number
  total_remaining: number
  monthly_installment: number
  due_day: number
  late_fee_type: 'pct_monthly' | 'pct_daily'
  late_fee_rate: number
  total_installments: number
  paid_installments: number
  schedules?: DebtSchedule[]
}

export interface DebtSchedule {
  id: string
  debt_id: string
  due_date: string
  amount: number
  status: 'unpaid' | 'paid' | 'late'
  paid_date: string | null
  paid_amount: number | null
}

export interface Settings {
  budget_bbm: number
  budget_makan: number
  budget_rokok: number
  budget_pulsa: number
  budget_rt: number
  debt_target_date: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardData {
  today: {
    income: number
    expense: number
    profit: number
    budget_remaining: number
  }
  debts: {
    total_remaining: number
    next_due: {
      platform: string
      amount: number
      due_date: string
      days_left: number
    } | null
  }
}

export interface DailyReport {
  date: string
  summary: {
    income: number
    expense: number
    profit: number
  }
  breakdown: {
    category: string
    amount: number
    budget: number
    percentage: number
  }[]
  transactions: Transaction[]
}
